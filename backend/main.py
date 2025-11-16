
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date, datetime
import requests
from sqlalchemy import create_engine, Column, Integer, String, Date, Text, select
from sqlalchemy.orm import sessionmaker, declarative_base
import pandas as pd

app = FastAPI(title="Weather App Pro API", version="1.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine("sqlite:///weather.db", echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

class Query(Base):
    __tablename__ = "queries"
    id = Column(Integer, primary_key=True)
    location = Column(String, nullable=False)
    latitude = Column(String, nullable=False)
    longitude = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    weather_summary = Column(Text, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

Base.metadata.create_all(engine)

class QueryIn(BaseModel):
    location: str
    start_date: date
    end_date: date
    @field_validator("end_date")
    @classmethod
    def check_dates(cls, v, info):
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("end_date must be on/after start_date")
        return v

class QueryOut(BaseModel):
    id: int
    location: str
    latitude: str
    longitude: str
    start_date: date
    end_date: date
    weather_summary: str
    created_at: str

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

def geocode_location(q: str):
    r = requests.get(GEOCODE_URL, params={"name": q, "count": 1})
    r.raise_for_status()
    data = r.json()
    if not data.get("results"):
        return None
    res = data["results"][0]
    return {
        "name": res.get("name"),
        "lat": res.get("latitude"),
        "lon": res.get("longitude"),
        "country": res.get("country")
    }

def fetch_weather(lat: float, lon: float, start: date, end: date):
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": True,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
        "timezone": "auto",
        "start_date": start.isoformat(),
        "end_date": end.isoformat()
    }
    r = requests.get(FORECAST_URL, params=params)
    r.raise_for_status()
    return r.json()

def summarize_weather(payload: dict):
    current = payload.get("current_weather", {})
    daily = payload.get("daily", {})
    lines = []
    if current:
        lines.append(f"Current: {current.get('temperature')}°C, wind {current.get('windspeed')} km/h")
    dates = daily.get("time", [])
    tmax = daily.get("temperature_2m_max", [])
    tmin = daily.get("temperature_2m_min", [])
    pprec = daily.get("precipitation_probability_max", [])
    wind = daily.get("wind_speed_10m_max", [])
    for i, d in enumerate(dates[:5]):
        tx = tmax[i] if i < len(tmax) else None
        tn = tmin[i] if i < len(tmin) else None
        pp = pprec[i] if i < len(pprec) else None
        ws = wind[i] if i < len(wind) else None
        lines.append(f"{d}: min {tn}°C / max {tx}°C, precip% {pp}, wind {ws} km/h")
    return "\n".join(lines) if lines else "No summary available."

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/queries", response_model=QueryOut)
def create_query(q: QueryIn):
    g = geocode_location(q.location)
    if not g:
        raise HTTPException(status_code=404, detail="Location not found (try a different spelling)")
    payload = fetch_weather(g["lat"], g["lon"], q.start_date, q.end_date)
    summary = summarize_weather(payload)
    with SessionLocal() as s:
        new_q = Query(
            location=f"{g['name']}, {g['country']}",
            latitude=str(g["lat"]),
            longitude=str(g["lon"]),
            start_date=q.start_date,
            end_date=q.end_date,
            weather_summary=summary
        )
        s.add(new_q)
        s.commit()
        s.refresh(new_q)
        return QueryOut(
            id=new_q.id, location=new_q.location, latitude=new_q.latitude, longitude=new_q.longitude,
            start_date=new_q.start_date, end_date=new_q.end_date, weather_summary=new_q.weather_summary,
            created_at=new_q.created_at
        )

@app.get("/queries", response_model=List[QueryOut])
def list_queries():
    with SessionLocal() as s:
        rows = s.execute(select(Query).order_by(Query.id.desc())).scalars().all()
        return [QueryOut(
            id=r.id, location=r.location, latitude=r.latitude, longitude=r.longitude,
            start_date=r.start_date, end_date=r.end_date, weather_summary=r.weather_summary,
            created_at=r.created_at
        ) for r in rows]

@app.get("/queries/{qid}", response_model=QueryOut)
def get_query(qid: int):
    with SessionLocal() as s:
        r = s.get(Query, qid)
        if not r:
            raise HTTPException(status_code=404, detail="Not found")
        return QueryOut(
            id=r.id, location=r.location, latitude=r.latitude, longitude=r.longitude,
            start_date=r.start_date, end_date=r.end_date, weather_summary=r.weather_summary,
            created_at=r.created_at
        )

class QueryUpdate(BaseModel):
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

@app.put("/queries/{qid}", response_model=QueryOut)
def update_query(qid: int, upd: QueryUpdate):
    with SessionLocal() as s:
        r = s.get(Query, qid)
        if not r:
            raise HTTPException(status_code=404, detail="Not found")
        loc = r.location
        lat = r.latitude
        lon = r.longitude
        if upd.location:
            g = geocode_location(upd.location)
            if not g:
                raise HTTPException(status_code=404, detail="Location not found for update")
            loc = f"{g['name']}, {g['country']}"
            lat = str(g["lat"])
            lon = str(g["lon"])
        start = upd.start_date or r.start_date
        end = upd.end_date or r.end_date
        if end < start:
            raise HTTPException(status_code=400, detail="end_date must be after start_date")
        payload = fetch_weather(float(lat), float(lon), start, end)
        summary = summarize_weather(payload)
        r.location, r.latitude, r.longitude = loc, lat, lon
        r.start_date, r.end_date = start, end
        r.weather_summary = summary
        s.commit(); s.refresh(r)
        return QueryOut(
            id=r.id, location=r.location, latitude=r.latitude, longitude=r.longitude,
            start_date=r.start_date, end_date=r.end_date, weather_summary=r.weather_summary,
            created_at=r.created_at
        )

@app.delete("/queries/{qid}")
def delete_query(qid: int):
    with SessionLocal() as s:
        r = s.get(Query, qid)
        if not r:
            raise HTTPException(status_code=404, detail="Not found")
        s.delete(r); s.commit()
        return {"deleted": qid}

@app.get("/export")
def export_queries(format: str = "json"):
    with SessionLocal() as s:
        rows = s.execute(select(Query)).scalars().all()
        data = [{
            "id": r.id,
            "location": r.location,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "start_date": r.start_date.isoformat(),
            "end_date": r.end_date.isoformat(),
            "weather_summary": r.weather_summary,
            "created_at": r.created_at
        } for r in rows]
    df = pd.DataFrame(data)
    fmt = format.lower()
    if fmt == "csv":
        return df.to_csv(index=False)
    if fmt == "xml":
        rows_xml = []
        rows_xml.append("<records>")
        for row in data:
            rows_xml.append("  <record>")
            for k,v in row.items():
                rows_xml.append(f"    <{k}>{str(v).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')}</{k}>")
            rows_xml.append("  </record>")
        rows_xml.append("</records>")
        return "\\n".join(rows_xml)
    if fmt in ["md", "markdown"]:
        if not data:
            return "# Export\\n\\n_No rows_"
        headers = list(data[0].keys())
        header_line = "| " + " | ".join(headers) + " |"
        sep_line = "|" + "|".join([" --- "]*len(headers)) + "|"
        lines = ["# Export", "", header_line, sep_line]
        for row in data:
            lines.append("| " + " | ".join(str(row[h]) for h in headers) + " |")
        return "\\n".join(lines)
    return {"data": data}

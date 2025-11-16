# 🌦️ Weather App Pro  
**AI Engineer Intern – Technical Assessment (Full-Stack)**  
**By: Christina Abdallah**

A complete weather-driven full-stack application built as part of the **PM Accelerator AI Engineer Intern** technical assessment.  
The app retrieves real-time weather data, processes 5-day forecasts, saves user queries to a database, provides CRUD functionality, exports data in multiple formats, displays an interactive map, and adapts its UI dynamically based on weather conditions.

---

# 🔥 Features Overview

### ⭐ Core Requirements (Assessment 1)
- Search weather by **city, ZIP code, GPS coordinates, or landmarks**  
- Real-time data via **Open-Meteo API** (no keys required)  
- Clean weather summary + detailed forecast  
- **5-day forecast** included  
- **Current-location weather** using Geolocation API  
- Icons, animations, and visual indicators for weather states (clear, cloudy, hot, rainy)

---

### ⭐ Advanced Requirements (Assessment 2)
#### ✔ CRUD + Database (Mandatory)
- CREATE: Save weather queries (location + date range)  
- READ: Load previously saved queries  
- UPDATE: Modify location/date range and auto-refresh results  
- DELETE: Remove entries  
- Validates:
  - Location existence (geocoding)  
  - Date ranges  
  - Input correctness  

#### ✔ Data Persistence
- **SQLite database**
- **SQLAlchemy ORM**

#### ✔ Extra API Integrations (Optional)
- Open-Meteo Geocoding API  
- Reverse Geocoding (for “Use My Location”)  
- Leaflet + OpenStreetMap tiles for map display  

#### ✔ Data Export (Optional)
Export all data from the DB as:
- JSON  
- CSV  
- XML  
- Markdown  

#### ✔ AI-Enhanced User Experience (Bonus)
- Intelligent “AI Tips” based on weather patterns  
(e.g., rain warnings, cold-weather advice, wind suggestions)

---

# 🧠 Tech Stack

### **Frontend**
- HTML  
- JavaScript  
- TailwindCSS  
- Leaflet Maps  
- CSS Animations (sun, clouds, rain, wind)

### **Backend**
- FastAPI  
- SQLite  
- SQLAlchemy  
- Pydantic Validation  
- Uvicorn  

### **APAPIs**
- Open-Meteo Forecast API  
- Open-Meteo Geocoding API  
- OpenStreetMap (Leaflet tiles)

---

# 🚀 Running the Project

## 📌 Backend Setup
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend starts at:  
👉 http://127.0.0.1:8000

API docs:  
👉 http://127.0.0.1:8000/docs

---

## 📌 Frontend Setup
Option 1 — open directly:  
➡️ Open `frontend/index.html` in your browser  

Option 2 — run local web server:
```bash
cd frontend
python -m http.server 5500
```
Frontend:  
👉 http://127.0.0.1:5500

---

# 📡 API Endpoints

### Weather Logic
- `POST /queries` – Create + fetch weather  
- `GET /queries` – List all saved queries  
- `GET /queries/{id}` – View one  
- `PUT /queries/{id}` – Update saved entry  
- `DELETE /queries/{id}` – Delete entry  

### Exports
- `GET /export?format=json`  
- `GET /export?format=csv`  
- `GET /export?format=xml`  
- `GET /export?format=md`  

---

# 🗺️ App Highlights (for reviewers)
- Interactive weather-based animations  
- Forecast-driven theme change (clear, hot, cloudy, rainy)  
- Interactive Leaflet map showing chosen location  
- AI-generated travel/weather tips  
- CRUD interface with live updates  
- Professionally structured backend with validation  
- Full end-to-end engineering: UI → API → DB → Export

---

# 🎥 Demo Video
*(Insert your video link here once recorded)*

---

# 👩🏻‍💻 About the Developer  
**Christina Abdallah – Aspiring AI Engineer**  
Applying for the **AI/ML/GenAI Engineer Intern** role and preparing for the  
**Master’s in Artificial Intelligence & Data Science at HHU Düsseldorf**.

This project demonstrates my ability to:
- Build full-stack AI-powered applications  
- Integrate APIs and design data pipelines  
- Work across frontend, backend, and database layers  
- Transform data into actionable, user-friendly insights  

---

# 💬 Contact
Feel free to reach out for collaboration or questions.

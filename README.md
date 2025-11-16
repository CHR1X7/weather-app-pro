
# 🌦️ Weather App Pro  
**AI Engineer Intern – Full-Stack Technical Assessment**  
**Built by: Christina Abdallah**

Weather App Pro is a full-stack weather intelligence system developed for the **PM Accelerator AI Engineer Internship** technical assessment.  
It goes beyond basic weather retrieval by integrating forecasting, geolocation, CRUD operations with persistence, data export, map visualization, and dynamic UI behavior based on real-world conditions.

This project demonstrates full-stack engineering, API integration, data modeling, and attention to user experience — aligned with the expectations of an AI/ML/GenAI internship.

---

# 🔥 Features Overview

## ⭐ Assessment 1 – Core Requirements
- Search weather by **city name, ZIP code, GPS coordinates, or landmarks**
- Real-time data via **Open-Meteo API** (no API key needed)
- Clean, responsive weather summary
- **5-day forecast**
- **Use My Location** (via HTML5 Geolocation API)
- Weather-based icons + animations (clear, cloudy, rainy, hot, windy)

---

## ⭐ Assessment 2 – Advanced Requirements

### ✔ CRUD + Database (Mandatory)
- **CREATE**: Save location + date ranges and fetch temperatures  
- **READ**: Display all saved entries  
- **UPDATE**: Modify saved queries with validation  
- **DELETE**: Remove records  

Validations include:
- Location existence  
- Date range logic  
- Input format checks  

### ✔ Persistence Layer
- SQLite  
- SQLAlchemy ORM  
- Clean models & schemas  

### ✔ Additional API Integrations (Bonus)
- Open-Meteo Geocoding  
- Reverse Geocoding  
- Leaflet + OpenStreetMap  

### ✔ Data Export (Bonus)
Export stored queries as:
- JSON  
- CSV  
- XML  
- Markdown  

### ✔ AI Smart Tips (Bonus)
Dynamic weather-based suggestions:
- Umbrella reminders  
- Heat safety  
- Cold weather clothing  
- Wind advisories  

---

# 🧠 Tech Stack

### **Frontend**
- HTML5  
- JavaScript  
- TailwindCSS  
- Leaflet  
- CSS animations  

### **Backend**
- FastAPI  
- SQLite  
- SQLAlchemy  
- Pydantic  
- Uvicorn  

---

# 🚀 Live Deployment

### **Frontend (Netlify)**
🔗 https://ca-weather-app-pro.netlify.app

### **Backend API (Render)**
🔗 https://weather-app-pro-9wqg.onrender.com  
API Docs: https://weather-app-pro-9wqg.onrender.com/docs

---

# 🖥️ Running Locally

## 1️⃣ Backend
```
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 2️⃣ Frontend
```
cd frontend
python -m http.server 5500
```

Open:
```
http://127.0.0.1:5500
```

### 👉 Auto-detect backend:
- Local → 127.0.0.1:8000  
- Deployed → Render backend  

---

# 📡 API Overview
CRUD endpoints, export formats, and weather retrieval documented at:  
➡️ https://weather-app-pro-9wqg.onrender.com/docs

---

# 🎥 Demo Video

https://www.loom.com/share/cf8e0e6192ad430e95addfa2b40f29db?t=194

---

# 👩🏻‍💻 About the Developer
**Christina Abdallah — Future AI Engineer**  
Computer Science graduate preparing for **AI & Data Science Master’s at HHU Düsseldorf**.

---

# 💬 Contact
- GitHub: https://github.com/CHR1X7  
- Email: christinaabdallah05@gmail.com

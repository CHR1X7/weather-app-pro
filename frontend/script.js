const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://weather-app-pro-9wqg.onrender.com";

const $ = (s) => document.querySelector(s);
const savedDiv = $("#saved");
const results = $("#results");
const about = $("#about");

$("#infoBtn").onclick = () => about.classList.toggle("hidden");
$("#refreshBtn").onclick = loadSaved;
$("#exportJson").onclick = (e) => { e.preventDefault(); window.open(`${API_BASE}/export?format=json`, "_blank"); };
$("#exportCsv").onclick = (e) => { e.preventDefault(); window.open(`${API_BASE}/export?format=csv`, "_blank"); };

$("#geoBtn").onclick = async () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1`;
    const r = await fetch(url);
    const j = await r.json();
    const name = j && j.results && j.results[0] ? j.results[0].name : `${latitude},${longitude}`;
    $("#location").value = name;
  }, (err) => alert("Failed to get location: " + err.message));
};

$("#searchBtn").onclick = async () => {
  const location = $("#location").value.trim();
  const start = $("#start").value;
  const end = $("#end").value;
  if (!location || !start || !end) return alert("Please fill location, start, and end dates");
  try {
    const r = await fetch(`${API_BASE}/queries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, start_date: start, end_date: end })
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.detail || "Request failed");
    }
    const j = await r.json();
    showResultWithMapAndTips(j);
    loadSaved();
  } catch (e) {
    alert("Error: " + e.message);
  }
};

function showResult(entry){
  results.innerHTML = `
    <div class="rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow p-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">${entry.location}</div>
        <div class="text-xs text-gray-400">${entry.start_date} → ${entry.end_date}</div>
      </div>
      <pre class="mt-2 whitespace-pre-wrap text-gray-800">${entry.weather_summary}</pre>
    </div>`;
}

// ----- Leaflet map -----
let map, marker;
function ensureMap(lat=0, lon=0){
  if(!map){
    map = L.map('map').setView([lat||0, lon||0], lat?10:2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
  } else {
    map.setView([lat, lon], 10);
  }
  if(marker){ marker.setLatLng([lat, lon]); }
  else if(lat && lon){ marker = L.marker([lat, lon]).addTo(map); }
}

// ----- AI Tips -----
function aiTipsFromSummary(summaryText){
  if(!summaryText) return "No tips available.";
  const t = summaryText.toLowerCase();
  const tips = [];
  if(t.includes("precip") || t.includes("rain")) tips.push("Pack a waterproof jacket or umbrella.");
  if(t.includes("wind")) tips.push("Expect windy conditions; wear layers and secure loose items.");
  const cold = /min\s(-?\d+)/.exec(t);
  const hot = /max\s(-?\d+)/.exec(t);
  if(cold && parseInt(cold[1],10) < 10) tips.push("Chilly weather expected — bring warm layers.");
  if(hot && parseInt(hot[1],10) > 28) tips.push("High temps expected — carry water and sun protection.");
  if(tips.length===0) tips.push("Weather looks manageable. Dress in layers and check updates before heading out.");
  return tips.map(s=>"- "+s).join("\\n");
}

// ----- Themes & Animations -----
function parseTemps(summaryText) {
  const mins = [...summaryText.matchAll(/min\\s(-?\\d+)\\s*°?c/gi)].map(m => parseInt(m[1],10));
  const maxs = [...summaryText.matchAll(/max\\s(-?\\d+)\\s*°?c/gi)].map(m => parseInt(m[1],10));
  return { min: mins.length ? Math.min(...mins) : null, max: maxs.length ? Math.max(...maxs) : null };
}
function decideTheme(summaryText) {
  const t = summaryText.toLowerCase();
  const { min, max } = parseTemps(summaryText);
  if (t.includes("precip")) return "rain";
  if (max !== null && max >= 30) return "hot";
  if (t.includes("wind")) return "cloudy";
  return "clear";
}
function setBodyTheme(theme) {
  document.body.classList.remove("theme-clear","theme-cloudy","theme-rain","theme-hot");
  document.body.classList.add(`theme-${theme}`);
}
function injectAnimation(theme) {
  const stage = document.getElementById("animStage");
  stage.innerHTML = "";
  if (theme === "hot" || theme === "clear") {
    const sun = document.createElement("div"); sun.className = "sun"; stage.appendChild(sun);
    ["c1","c2","c3"].forEach(c=>{ const cl=document.createElement("div"); cl.className="cloud "+c; stage.appendChild(cl); });
  } else if (theme === "cloudy") {
    ["c1","c2","c3","c1","c2"].forEach((c,i)=>{ const cl=document.createElement("div"); cl.className="cloud "+c; cl.style.opacity=0.8 - i*0.1; stage.appendChild(cl); });
    [""," w2"," w3"].forEach(cls=>{ const wl=document.createElement("div"); wl.className="windline"+cls; stage.appendChild(wl); });
  } else if (theme === "rain") {
    ["c1","c2","c3"].forEach(c=>{ const cl=document.createElement("div"); cl.className="cloud "+c; stage.appendChild(cl); });
    for (let i=0;i<60;i++){ const d=document.createElement("div"); d.className="raindrop"; d.style.left=(Math.random()*100)+"%"; d.style.animationDuration=(0.9+Math.random()*0.8)+"s"; d.style.opacity=(0.4+Math.random()*0.6); stage.appendChild(d); }
  }
}

function showResultWithMapAndTips(entry){
  showResult(entry);
  const lat = parseFloat(entry.latitude);
  const lon = parseFloat(entry.longitude);
  if(!isNaN(lat) && !isNaN(lon)) ensureMap(lat, lon);
  const tips = aiTipsFromSummary(entry.weather_summary)
  .replace(/\\n/g, "\n");
  document.getElementById("aiTips").innerHTML =
  tips.split(/\r?\n/).map(line => `${line}<br>`).join("");

  const theme = decideTheme(entry.weather_summary);
  setBodyTheme(theme);
  injectAnimation(theme);
}

async function loadSaved(){
  const r = await fetch(`${API_BASE}/queries`);
  const j = await r.json();
  savedDiv.innerHTML = "";
  j.forEach(row => {
    const card = document.createElement("div");
    card.className = "rounded-xl border border-gray-100 bg-white shadow p-3";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="font-medium">${row.location}</div>
        <div class="text-xs text-gray-500">#${row.id}</div>
      </div>
      <div class="text-xs text-gray-500 mt-1">${row.start_date} → ${row.end_date}</div>
      <pre class="mt-2 whitespace-pre-wrap text-gray-800">${row.weather_summary}</pre>
      <div class="mt-2 flex gap-2">
        <button data-id="${row.id}" class="edit px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">Update</button>
        <button data-id="${row.id}" class="del px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm">Delete</button>
      </div>`;
    card.querySelector(".del").onclick = async (e) => {
      const id = e.target.getAttribute("data-id");
      await fetch(`${API_BASE}/queries/${id}`, { method: "DELETE" });
      loadSaved();
    };
    card.querySelector(".edit").onclick = async (e) => {
      const id = e.target.getAttribute("data-id");
      const newLoc = prompt("New location (blank = keep):", row.location);
      const newStart = prompt("New start date (YYYY-MM-DD, blank = keep):", row.start_date);
      const newEnd = prompt("New end date (YYYY-MM-DD, blank = keep):", row.end_date);
      const body = {};
      if (newLoc && newLoc.trim()) body.location = newLoc.trim();
      if (newStart && newStart.trim()) body.start_date = newStart.trim();
      if (newEnd && newEnd.trim()) body.end_date = newEnd.trim();
      const r2 = await fetch(`${API_BASE}/queries/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r2.ok) { const err = await r2.json(); alert("Update failed: " + (err.detail || r2.statusText)); return; }
      loadSaved();
    };
    savedDiv.appendChild(card);
  });
}

loadSaved();

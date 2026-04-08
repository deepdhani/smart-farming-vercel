# 🌾 Smart Farming Assistant — Mountain Regions (Uttarakhand, India)

An AI-powered full-stack platform helping Himalayan farmers with crop recommendations, disease detection, weather insights, and more.

---

## 📁 Project Structure

```
smart-farming/
├── frontend/          # React.js + Tailwind CSS
├── backend/           # Python FastAPI
├── ml-models/
│   ├── crop-recommendation/   # Random Forest (scikit-learn)
│   └── disease-detection/     # CNN (TensorFlow/Keras)
├── datasets/          # Sample/mock datasets
└── docs/              # Architecture & API docs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- OpenWeatherMap API key

---

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file manually — copy the contents of .env.example into a new file called .env
# Then fill in your keys (at minimum: OPENWEATHER_API_KEY and MONGO_URI)
# Example on Mac/Linux:
#   cp .env.example .env
#   nano .env      ← edit here
# Example on Windows:
#   copy .env.example .env
#   notepad .env   ← edit here

uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
cp .env.example .env.local
# Set REACT_APP_API_URL=http://localhost:8000

npm start
```

Runs at: `http://localhost:3000`

---

### 3. Train ML Models

```bash
# Crop Recommendation
cd ml-models/crop-recommendation
pip install -r requirements.txt
python train.py

# Disease Detection (requires dataset)
cd ml-models/disease-detection
python train.py
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/weather/{district}` | Weather + smart insights |
| POST | `/crop-recommend` | Crop recommendations |
| POST | `/disease-detect` | Upload image → disease |
| POST | `/soil` | Soil analysis + tips |
| POST | `/irrigation` | Irrigation schedule |
| GET | `/market/{crop}` | Mandi prices |
| GET | `/alerts/{user_id}` | User alerts |

---

## 🌍 Deployment

### Backend (Railway / Render)
```bash
# Set env vars on platform
# Start command:
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy /build folder
```

### MongoDB
Use MongoDB Atlas free tier — update `MONGO_URI` in env.

---

## 📱 Offline & SMS Architecture

- Backend responses are kept lightweight (<5KB)
- Last recommendations cached in localStorage
- Alert system designed for Twilio SMS integration
- Add `TWILIO_SID` and `TWILIO_TOKEN` to env when ready

---

## 🌐 Languages Supported
- English
- Hindi (UI labels + recommendations)

---

## ⚠️ Troubleshooting

### "Dependency conflict" warnings during pip install
These are **warnings, not errors** — the server still starts fine. They appear because
system packages like `gradio` pin older versions. The `>=` ranges in `requirements.txt`
let pip resolve compatible versions automatically.

### Backend starts but weather returns mock data
You haven't set `OPENWEATHER_API_KEY` in your `.env` yet. The app works with mock data —
just open `.env` and paste your free key from https://openweathermap.org/api

### MongoDB connection error
Make sure MongoDB is running:
```bash
# Mac (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod
```
Or use MongoDB Atlas — paste the connection string into `MONGO_URI` in `.env`.

### Frontend shows blank page
Make sure `frontend/.env.local` has:
```
REACT_APP_API_URL=http://localhost:8000
```

### Disease detection returns mock results
The CNN model needs training first. Download the PlantVillage dataset from Kaggle,
place at `datasets/plant_disease/`, then run `python ml-models/disease-detection/train.py`.

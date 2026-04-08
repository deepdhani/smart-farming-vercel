# System Architecture — Smart Farming Assistant

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FARMER'S PHONE                         │
│   React PWA (Mobile-first, Hindi/English, Offline cache)    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS REST API
┌────────────────────▼────────────────────────────────────────┐
│              FastAPI Backend (Python)                        │
│  /auth  /weather  /crop-recommend  /disease-detect          │
│  /soil  /irrigation  /market  /alerts                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  JWT Auth    │  │ Weather Svc  │  │  ML Inference    │  │
│  │  (bcrypt)    │  │ (OpenWeather)│  │  (joblib/TF)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────┬──────────────────────────────────────┬────────────┘
         │                                      │
┌────────▼────────┐               ┌─────────────▼────────────┐
│    MongoDB      │               │       ML Models           │
│  (Motor async)  │               │  crop_rf.pkl (sklearn)    │
│  Users, Alerts  │               │  plant_cnn.h5 (TF/Keras) │
└─────────────────┘               └──────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│               External APIs                                  │
│  OpenWeatherMap · (Future: Twilio SMS, Agmarknet prices)    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Crop Recommendation

```
Farmer Input (soil, season, altitude, temp)
        ↓
  FastAPI /crop-recommend
        ↓
  ┌─────────────────────────┐
  │  Rule-based engine      │  → Score each crop against
  │  (CROP_DATABASE)        │    altitude + temp + soil + season
  └─────────────────────────┘
        ↓
  ┌─────────────────────────┐
  │  RandomForest model     │  → Additional ML suggestion
  │  (if model.pkl exists)  │
  └─────────────────────────┘
        ↓
  Ranked crop recommendations + sowing time + yield
```

## Data Flow: Disease Detection

```
Farmer takes leaf photo
        ↓
  React: FormData upload
        ↓
  FastAPI /disease-detect
        ↓
  PIL resize → 224×224 numpy array
        ↓
  MobileNetV2 CNN (TF/Keras)
        ↓
  Softmax → class index → disease name
        ↓
  Treatment + Organic remedy lookup
        ↓
  Response to farmer
```

## Offline Strategy

- JWT and user profile cached in localStorage
- Last weather + crop recommendations cached
- Backend responses designed to be <5KB
- Alert system designed for Twilio SMS fallback:
  ```
  Future: POST /alerts/sms
    → Twilio API → farmer's mobile
  ```

## Security

- Passwords: bcrypt hashed (cost factor 12)
- Auth: JWT HS256, 72hr expiry
- CORS: Restricted to frontend origin
- File uploads: Content-type validated, size-limited
- MongoDB: Motor async driver, no raw query strings

## Deployment Targets

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend  | Vercel   | `npm run build` → static |
| Backend   | Railway / Render | `uvicorn main:app` |
| Database  | MongoDB Atlas | Free M0 tier |
| ML Models | Bundled with backend | Loaded at startup |

## Folder Structure

```
smart-farming/
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.jsx              # Root + routing
│   │   ├── index.js
│   │   ├── index.css            # Tailwind + global styles
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Global user state + JWT
│   │   │   └── LangContext.jsx  # Hindi/English i18n
│   │   ├── utils/api.js         # Axios + token injection
│   │   ├── components/shared/
│   │   │   └── Layout.jsx       # Shell + bottom nav
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── WeatherPage.jsx
│   │       ├── CropsPage.jsx
│   │       ├── DiseasePage.jsx
│   │       ├── SoilPage.jsx
│   │       ├── IrrigationPage.jsx
│   │       ├── MarketPage.jsx
│   │       └── AlertsPage.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py                  # FastAPI app + lifespan
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/database.py       # MongoDB Motor connection
│   ├── middleware/auth.py       # JWT dependency
│   └── routes/
│       ├── auth.py              # Register + Login
│       ├── weather.py           # OpenWeatherMap + insights
│       ├── crops.py             # Rule-based + RF model
│       ├── disease.py           # CNN inference
│       ├── soil.py              # Soil analysis
│       ├── irrigation.py        # Irrigation schedule
│       ├── market.py            # Mandi prices
│       └── alerts.py            # User alerts CRUD
│
├── ml-models/
│   ├── crop-recommendation/
│   │   ├── train.py             # RandomForest training
│   │   ├── model.pkl            # (generated after training)
│   │   └── label_encoder.pkl    # (generated after training)
│   └── disease-detection/
│       ├── train.py             # MobileNetV2 CNN training
│       └── model/
│           └── plant_disease_cnn.h5  # (generated after training)
│
├── datasets/
│   ├── crop_sample.csv          # Synthetic crop training data
│   └── mandi_prices_sample.csv  # Sample mandi price data
│
└── docs/
    └── architecture.md          # This file
```

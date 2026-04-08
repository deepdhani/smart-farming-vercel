# main.py — Vercel serverless FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Smart Farming Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect DB on first request (serverless — no lifespan)
_db_connected = False

async def ensure_db():
    global _db_connected
    if not _db_connected:
        from config.database import connect_db
        await connect_db()
        _db_connected = True

from fastapi import Request

@app.middleware("http")
async def db_middleware(request: Request, call_next):
    await ensure_db()
    return await call_next(request)

# Routes
from routes import auth, weather, crops, disease, soil, irrigation, market, alerts

app.include_router(auth.router,       prefix="/api/auth",           tags=["Auth"])
app.include_router(weather.router,    prefix="/api/weather",        tags=["Weather"])
app.include_router(crops.router,      prefix="/api/crop-recommend", tags=["Crops"])
app.include_router(disease.router,    prefix="/api/disease-detect", tags=["Disease"])
app.include_router(soil.router,       prefix="/api/soil",           tags=["Soil"])
app.include_router(irrigation.router, prefix="/api/irrigation",     tags=["Irrigation"])
app.include_router(market.router,     prefix="/api/market",         tags=["Market"])
app.include_router(alerts.router,     prefix="/api/alerts",         tags=["Alerts"])

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.get("/api")
async def root():
    return {"message": "Smart Farming API running"}

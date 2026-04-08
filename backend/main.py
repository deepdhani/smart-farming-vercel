# main.py — Vercel serverless FastAPI backend

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os

from config.database import connect_db_sync
from routes import auth, weather, crops, disease, soil, irrigation, market, alerts

app = FastAPI(title="Smart Farming Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
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

@app.on_event("startup")
async def startup():
    await connect_db_sync()

# Vercel handler
handler = Mangum(app)

# routes/crops.py — Crop recommendation (rule-based + ML model)

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user
import joblib
import numpy as np
import os

router = APIRouter()

# Load trained model if available
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
_model = None

def get_model():
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = joblib.load(MODEL_PATH)
    return _model


# ── Rule-based knowledge base for Himalayan crops ───────────────────────────

CROP_DATABASE = {
    "rajma": {
        "name": "Rajma (Kidney Beans)",
        "name_hi": "राजमा",
        "altitude_range": (1500, 3000),
        "temp_range": (15, 25),
        "seasons": ["kharif"],
        "soil_types": ["loamy", "clay-loam"],
        "sowing_time": "April–May",
        "sowing_time_hi": "अप्रैल–मई",
        "yield_qtl_per_acre": 8,
        "description": "High-value crop, ideal for Himalayan soil",
    },
    "apple": {
        "name": "Apple",
        "name_hi": "सेब",
        "altitude_range": (1500, 3000),
        "temp_range": (5, 20),
        "seasons": ["rabi", "zaid"],
        "soil_types": ["loamy", "sandy-loam"],
        "sowing_time": "February–March",
        "sowing_time_hi": "फरवरी–मार्च",
        "yield_qtl_per_acre": 120,
        "description": "High-value fruit, major income source in hills",
    },
    "finger_millet": {
        "name": "Finger Millet (Mandua)",
        "name_hi": "मंडुआ / रागी",
        "altitude_range": (1000, 2500),
        "temp_range": (18, 30),
        "seasons": ["kharif"],
        "soil_types": ["loamy", "sandy", "red"],
        "sowing_time": "June–July",
        "sowing_time_hi": "जून–जुलाई",
        "yield_qtl_per_acre": 6,
        "description": "Drought-resistant, nutritious traditional crop",
    },
    "potato": {
        "name": "Potato",
        "name_hi": "आलू",
        "altitude_range": (1200, 3500),
        "temp_range": (10, 22),
        "seasons": ["rabi", "kharif"],
        "soil_types": ["loamy", "sandy-loam", "clay"],
        "sowing_time": "March–April / Sept–Oct",
        "sowing_time_hi": "मार्च–अप्रैल / सितम्बर–अक्टूबर",
        "yield_qtl_per_acre": 80,
        "description": "Cash crop, well-adapted to mountain regions",
    },
    "buckwheat": {
        "name": "Buckwheat (Kuttu)",
        "name_hi": "कुट्टू",
        "altitude_range": (2000, 4000),
        "temp_range": (5, 20),
        "seasons": ["kharif", "zaid"],
        "soil_types": ["loamy", "sandy", "rocky"],
        "sowing_time": "May–June",
        "sowing_time_hi": "मई–जून",
        "yield_qtl_per_acre": 4,
        "description": "High-altitude staple, frost-tolerant",
    },
    "pea": {
        "name": "Peas",
        "name_hi": "मटर",
        "altitude_range": (1000, 2500),
        "temp_range": (10, 18),
        "seasons": ["rabi", "zaid"],
        "soil_types": ["loamy", "clay-loam"],
        "sowing_time": "October–November",
        "sowing_time_hi": "अक्टूबर–नवंबर",
        "yield_qtl_per_acre": 15,
        "description": "Popular vegetable crop, good market demand",
    },
    "garlic": {
        "name": "Garlic",
        "name_hi": "लहसुन",
        "altitude_range": (800, 2200),
        "temp_range": (12, 24),
        "seasons": ["rabi"],
        "soil_types": ["loamy", "sandy-loam"],
        "sowing_time": "October–November",
        "sowing_time_hi": "अक्टूबर–नवंबर",
        "yield_qtl_per_acre": 25,
        "description": "High demand medicinal crop with good export value",
    },
    "barley": {
        "name": "Barley (Jau)",
        "name_hi": "जौ",
        "altitude_range": (1500, 3500),
        "temp_range": (8, 20),
        "seasons": ["rabi"],
        "soil_types": ["loamy", "sandy", "clay"],
        "sowing_time": "October–November",
        "sowing_time_hi": "अक्टूबर–नवंबर",
        "yield_qtl_per_acre": 12,
        "description": "Cold-tolerant grain, grown at very high altitudes",
    },
}


# ── Request model ────────────────────────────────────────────────────────────

class CropRecommendRequest(BaseModel):
    soil_type: str        # loamy, clay, sandy, clay-loam, red
    season: str           # kharif, rabi, zaid
    altitude_meters: int  # farmer's field altitude
    temperature: float    # current or avg temperature
    rainfall_mm: float = 800  # annual average


# ── Main recommendation logic ────────────────────────────────────────────────

@router.post("/")
async def recommend_crops(
    data: CropRecommendRequest,
    current_user: dict = Depends(get_current_user)
):
    lang = current_user.get("language", "hi")
    recommendations = []

    # Score each crop based on match
    for crop_id, crop in CROP_DATABASE.items():
        score = 0

        # Altitude match (most important for mountains)
        alt_min, alt_max = crop["altitude_range"]
        if alt_min <= data.altitude_meters <= alt_max:
            score += 40
        elif abs(data.altitude_meters - alt_min) < 300 or abs(data.altitude_meters - alt_max) < 300:
            score += 20  # close to range

        # Temperature match
        t_min, t_max = crop["temp_range"]
        if t_min <= data.temperature <= t_max:
            score += 30
        elif abs(data.temperature - t_min) < 5 or abs(data.temperature - t_max) < 5:
            score += 15

        # Season match
        if data.season in crop["seasons"]:
            score += 20

        # Soil match
        if data.soil_type.lower() in crop["soil_types"]:
            score += 10

        if score >= 50:
            recommendations.append({
                "crop_id": crop_id,
                "name": crop["name_hi"] if lang == "hi" else crop["name"],
                "name_en": crop["name"],
                "score": score,
                "sowing_time": crop["sowing_time_hi"] if lang == "hi" else crop["sowing_time"],
                "expected_yield": f"{crop['yield_qtl_per_acre']} क्विंटल/एकड़" if lang == "hi"
                                   else f"{crop['yield_qtl_per_acre']} qtl/acre",
                "description": crop["description"],
            })

    # Sort by score descending
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    top = recommendations[:4]

    # Also try ML model if loaded
    ml_suggestion = _try_ml_model(data)

    return {
        "recommendations": top,
        "ml_suggestion": ml_suggestion,
        "inputs": data.model_dump(),
        "total_found": len(recommendations)
    }


def _try_ml_model(data: CropRecommendRequest) -> str | None:
    """Run RandomForest model if available."""
    model = get_model()
    if model is None:
        return None
    try:
        # Encode soil type
        soil_map = {"sandy": 0, "loamy": 1, "clay": 2, "clay-loam": 3, "red": 4, "sandy-loam": 5}
        soil_enc = soil_map.get(data.soil_type.lower(), 1)
        season_map = {"kharif": 0, "rabi": 1, "zaid": 2}
        season_enc = season_map.get(data.season.lower(), 0)

        features = np.array([[soil_enc, season_enc, data.altitude_meters,
                               data.temperature, data.rainfall_mm]])
        prediction = model.predict(features)[0]
        return prediction
    except Exception:
        return None

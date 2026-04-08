# routes/market.py — Mandi price data (mock + future API integration)
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user

router = APIRouter()

# Mock mandi prices (Rs/quintal) — replace with real mandi API later
MOCK_PRICES = {
    "potato":    {"price": 1200, "trend": "up",   "best_market": "Dehradun"},
    "apple":     {"price": 6500, "trend": "up",   "best_market": "Delhi APMC"},
    "rajma":     {"price": 8000, "trend": "stable","best_market": "Haridwar"},
    "pea":       {"price": 2200, "trend": "down",  "best_market": "Roorkee"},
    "garlic":    {"price": 9500, "trend": "up",   "best_market": "Kashipur"},
    "tomato":    {"price": 900,  "trend": "down",  "best_market": "Dehradun"},
    "barley":    {"price": 1800, "trend": "stable","best_market": "Haridwar"},
    "buckwheat": {"price": 3200, "trend": "up",   "best_market": "Chamoli"},
}

@router.get("/{crop}")
async def get_market_price(crop: str, current_user: dict = Depends(get_current_user)):
    lang = current_user.get("language", "hi")
    data = MOCK_PRICES.get(crop.lower())
    if not data:
        return {"message": "Crop not found", "available": list(MOCK_PRICES.keys())}

    trend_label = {"up": "📈 बढ़ रहा है", "down": "📉 घट रहा है", "stable": "➡️ स्थिर"} if lang == "hi" \
                  else {"up": "📈 Rising", "down": "📉 Falling", "stable": "➡️ Stable"}

    return {
        "crop": crop,
        "price_per_quintal": data["price"],
        "currency": "INR",
        "trend": trend_label[data["trend"]],
        "best_market": data["best_market"],
        "advice": (
            "अभी बेचना फायदेमंद है" if data["trend"] == "up" and lang == "hi"
            else "Good time to sell" if data["trend"] == "up"
            else ("कुछ दिन प्रतीक्षा करें" if lang == "hi" else "Wait a few days for better price")
        ),
        "source": "mock_data"
    }


# routes/alerts.py
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from config.database import get_db
from datetime import datetime

router = APIRouter()

@router.get("/{user_id}")
async def get_alerts(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    alerts = await db.alerts.find({"user_id": user_id}).sort("created_at", -1).limit(20).to_list(20)
    for a in alerts:
        a["id"] = str(a["_id"])
        del a["_id"]
    return {"alerts": alerts, "count": len(alerts)}

@router.post("/create")
async def create_alert(alert: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    alert["user_id"] = current_user["id"]
    alert["created_at"] = datetime.utcnow()
    alert["read"] = False
    await db.alerts.insert_one(alert)
    return {"status": "created"}

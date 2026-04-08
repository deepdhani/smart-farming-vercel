# routes/alerts.py — User alerts (weather, disease, price)
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from config.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/{user_id}")
async def get_alerts(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    alerts = await db.alerts.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(20).to_list(20)

    for a in alerts:
        a["id"] = str(a["_id"])
        del a["_id"]

    return {"alerts": alerts, "count": len(alerts)}


@router.patch("/{alert_id}/read")
async def mark_read(alert_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    await db.alerts.update_one({"_id": ObjectId(alert_id)}, {"$set": {"read": True}})
    return {"status": "updated"}

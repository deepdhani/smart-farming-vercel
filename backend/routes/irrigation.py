# routes/irrigation.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user

router = APIRouter()

class IrrigationInput(BaseModel):
    crop: str
    soil_moisture_percent: float
    temperature: float
    rain_expected: bool
    days_since_last_irrigation: int

@router.post("/")
async def irrigation_advice(data: IrrigationInput, current_user: dict = Depends(get_current_user)):
    lang = current_user.get("language", "hi")
    irrigate_today = False
    message = ""
    schedule = []

    if data.rain_expected:
        message = "बारिश की संभावना है — आज सिंचाई न करें" if lang == "hi" else "Rain expected — skip irrigation today"
    elif data.soil_moisture_percent < 30:
        irrigate_today = True
        message = "मिट्टी बहुत सूखी है — तुरंत सिंचाई करें" if lang == "hi" else "Soil very dry — irrigate now"
    elif data.soil_moisture_percent < 50 and data.days_since_last_irrigation >= 3:
        irrigate_today = True
        message = "सिंचाई की जरूरत है" if lang == "hi" else "Irrigation needed"
    else:
        message = "सिंचाई की जरूरत नहीं" if lang == "hi" else "No irrigation needed today"

    water_saving = (
        ["सुबह 6–8 बजे सिंचाई करें", "ड्रिप सिंचाई का उपयोग करें", "मल्चिंग से नमी बचाएं"]
        if lang == "hi"
        else ["Irrigate 6–8 AM to reduce evaporation", "Use drip irrigation if possible", "Mulching saves 30% water"]
    )

    return {
        "irrigate_today": irrigate_today,
        "message": message,
        "water_saving_tips": water_saving,
        "next_check_days": 1 if irrigate_today else 2,
    }

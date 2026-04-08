# routes/soil.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user

router = APIRouter()

class SoilInput(BaseModel):
    ph: float
    moisture_percent: float
    soil_type: str
    nitrogen: str = "medium"   # low / medium / high
    phosphorus: str = "medium"
    potassium: str = "medium"

@router.post("/")
async def soil_analysis(data: SoilInput, current_user: dict = Depends(get_current_user)):
    lang = current_user.get("language", "hi")
    tips = []
    fertilizers = []

    # pH-based recommendations
    if data.ph < 5.5:
        tips.append("Soil is too acidic — apply lime (CaCO3) @ 2 qtl/acre" if lang == "en"
                    else "मिट्टी बहुत अम्लीय है — चूना (CaCO3) 2 क्विंटल/एकड़ डालें")
    elif data.ph > 7.5:
        tips.append("Soil is alkaline — apply gypsum @ 1 qtl/acre" if lang == "en"
                    else "मिट्टी क्षारीय है — जिप्सम 1 क्विंटल/एकड़ डालें")
    else:
        tips.append("Soil pH is ideal (6.0–7.0)" if lang == "en"
                    else "मिट्टी की pH आदर्श है (6.0–7.0)")

    # Nutrient recommendations
    if data.nitrogen == "low":
        fertilizers.append("Urea @ 50 kg/acre OR vermicompost @ 2 tons/acre" if lang == "en"
                            else "यूरिया 50 किग्रा/एकड़ या वर्मीकम्पोस्ट 2 टन/एकड़")
    if data.phosphorus == "low":
        fertilizers.append("DAP @ 25 kg/acre" if lang == "en"
                            else "DAP 25 किग्रा/एकड़")
    if data.potassium == "low":
        fertilizers.append("Muriate of Potash (MOP) @ 20 kg/acre" if lang == "en"
                            else "म्यूरेट ऑफ पोटाश (MOP) 20 किग्रा/एकड़")

    # Crop rotation suggestions
    rotation = (
        ["Potato → Peas → Barley → Fallow"] if lang == "en"
        else ["आलू → मटर → जौ → खाली भूमि"]
    )

    organic_tips = (
        ["Compost green manure (dhaincha) before sowing", "Avoid burning crop residue"]
        if lang == "en"
        else ["बुवाई से पहले हरी खाद (ढेंचा) डालें", "फसल अवशेष न जलाएं"]
    )

    return {
        "ph_status": "acidic" if data.ph < 6 else ("alkaline" if data.ph > 7.5 else "ideal"),
        "tips": tips,
        "fertilizer_recommendations": fertilizers,
        "crop_rotation": rotation,
        "organic_tips": organic_tips,
    }

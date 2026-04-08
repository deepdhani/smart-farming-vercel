# routes/weather.py — Real-time weather + smart farming insights

from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import get_current_user
import httpx
from config.database import settings

router = APIRouter()

# Districts → coordinates mapping for Uttarakhand
DISTRICT_COORDS = {
    "chamoli":     (30.4083, 79.3214),
    "uttarkashi":  (30.7268, 78.4354),
    "pithoragarh": (29.5820, 80.2180),
    "rudraprayag": (30.2847, 78.9822),
    "tehri":       (30.3780, 78.4322),
    "pauri":       (29.7729, 78.7792),
    "almora":      (29.5971, 79.6591),
    "bageshwar":   (29.8380, 79.7710),
    "champawat":   (29.3338, 80.0908),
    "nainital":    (29.3919, 79.4542),
    "dehradun":    (30.3165, 78.0322),
    "haridwar":    (29.9457, 78.1642),
    "sissu":       (32.4833, 77.1167),   # Lahaul (HP)
}


def generate_farming_insights(weather: dict, altitude: int, lang: str = "hi") -> list[str]:
    """
    Rule-based smart insights based on weather conditions and altitude.
    Returns insights in Hindi or English.
    """
    insights = []
    temp = weather.get("temp", 20)
    humidity = weather.get("humidity", 50)
    rain_prob = weather.get("rain_prob", 0)
    wind_speed = weather.get("wind_speed", 0)

    if lang == "hi":
        # Frost warning (critical above 2000m)
        if temp < 2 and altitude > 2000:
            insights.append("⚠️ पाला पड़ने की संभावना — फसल को ढकें")
        if temp >= 15 and temp <= 28 and rain_prob < 30:
            insights.append("✅ बुवाई के लिए अच्छा दिन")
        if rain_prob > 60:
            insights.append("🚫 आज सिंचाई न करें — बारिश की संभावना है")
        if humidity > 80:
            insights.append("🍄 फंगल रोग का खतरा — पत्तियों की जांच करें")
        if wind_speed > 20:
            insights.append("💨 तेज हवा — छिड़काव न करें")
        if temp > 35:
            insights.append("☀️ अधिक गर्मी — सुबह या शाम को सिंचाई करें")
    else:
        if temp < 2 and altitude > 2000:
            insights.append("⚠️ Frost warning — cover crops tonight")
        if temp >= 15 and temp <= 28 and rain_prob < 30:
            insights.append("✅ Good conditions for sowing today")
        if rain_prob > 60:
            insights.append("🚫 Avoid irrigation — rain expected")
        if humidity > 80:
            insights.append("🍄 High fungal disease risk — inspect leaves")
        if wind_speed > 20:
            insights.append("💨 Strong winds — avoid spraying pesticides")
        if temp > 35:
            insights.append("☀️ Very hot — irrigate early morning or evening")

    return insights if insights else (
        ["🌤️ मौसम सामान्य है"] if lang == "hi" else ["🌤️ Weather looks normal"]
    )


@router.get("/{district}")
async def get_weather(
    district: str,
    current_user: dict = Depends(get_current_user)
):
    district_lower = district.lower()
    coords = DISTRICT_COORDS.get(district_lower)

    if not coords:
        # Fallback: try using district name directly
        coords = (30.3165, 78.0322)  # Dehradun default

    lat, lon = coords
    lang = current_user.get("language", "hi")
    altitude = current_user.get("altitude_meters", 1500)

    api_key = settings.openweather_api_key

    if not api_key:
        # Return mock data if no API key configured
        return _mock_weather(district, altitude, lang)

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric"},
                timeout=5.0
            )
            data = resp.json()

        weather = {
            "temp": round(data["main"]["temp"], 1),
            "feels_like": round(data["main"]["feels_like"], 1),
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "rain_prob": data.get("rain", {}).get("1h", 0) * 10,  # rough estimate
        }

        return {
            "district": district,
            "altitude_meters": altitude,
            "weather": weather,
            "insights": generate_farming_insights(weather, altitude, lang),
            "source": "openweathermap"
        }

    except Exception as e:
        return _mock_weather(district, altitude, lang)


def _mock_weather(district: str, altitude: int, lang: str) -> dict:
    """Return realistic mock data when API key is absent."""
    # Simulate cooler temps at higher altitude
    base_temp = max(5, 22 - (altitude // 500))
    mock = {
        "temp": base_temp,
        "feels_like": base_temp - 3,
        "humidity": 65,
        "description": "partly cloudy",
        "wind_speed": 8,
        "rain_prob": 20,
    }
    return {
        "district": district,
        "altitude_meters": altitude,
        "weather": mock,
        "insights": generate_farming_insights(mock, altitude, lang),
        "source": "mock"
    }

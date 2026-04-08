# routes/disease.py — Plant disease detection
# TensorFlow is optional — falls back to mock if not installed

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from middleware.auth import get_current_user
import numpy as np
import io
import os

router = APIRouter()

# Try importing TF and PIL — optional on deploy
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

DISEASE_LABELS = {
    0:  {"name": "Apple Scab",          "name_hi": "सेब का पपड़ी रोग"},
    1:  {"name": "Apple Black Rot",     "name_hi": "सेब का काला सड़न"},
    2:  {"name": "Apple Cedar Rust",    "name_hi": "सेब का देवदार जंग"},
    3:  {"name": "Apple Healthy",       "name_hi": "सेब — स्वस्थ"},
    4:  {"name": "Potato Early Blight", "name_hi": "आलू का अगेती झुलसा"},
    5:  {"name": "Potato Late Blight",  "name_hi": "आलू का पछेती झुलसा"},
    6:  {"name": "Potato Healthy",      "name_hi": "आलू — स्वस्थ"},
    7:  {"name": "Tomato Leaf Curl",    "name_hi": "टमाटर पत्ती मरोड़"},
    8:  {"name": "Tomato Early Blight", "name_hi": "टमाटर का अगेती झुलसा"},
    9:  {"name": "Tomato Healthy",      "name_hi": "टमाटर — स्वस्थ"},
    10: {"name": "Bean Rust",           "name_hi": "बीन का जंग रोग"},
    11: {"name": "Bean Healthy",        "name_hi": "बीन — स्वस्थ"},
}

TREATMENTS = {
    "Apple Scab": {
        "treatment": "Apply Mancozeb or Captan fungicide at 10-day intervals.",
        "treatment_hi": "10 दिन के अंतर पर मैनकोज़ेब या कैप्टान फफूंदनाशक छिड़कें।",
        "organic": "Spray neem oil solution (5ml/L) every 7 days.",
        "organic_hi": "हर 7 दिन नीम तेल घोल (5ml/L) छिड़कें।",
    },
    "Potato Early Blight": {
        "treatment": "Use Chlorothalonil or Mancozeb. Remove infected leaves.",
        "treatment_hi": "क्लोरोथालोनिल या मैनकोज़ेब उपयोग करें। संक्रमित पत्तियां हटाएं।",
        "organic": "Copper-based spray + improve air circulation.",
        "organic_hi": "तांबे का छिड़काव + हवा का प्रवाह सुधारें।",
    },
    "Potato Late Blight": {
        "treatment": "Urgent: Apply Metalaxyl immediately. Destroy infected plants.",
        "treatment_hi": "तुरंत मेटालैक्सिल लगाएं। संक्रमित पौधे नष्ट करें।",
        "organic": "Bordeaux mixture spray as preventive measure.",
        "organic_hi": "बोर्डो मिश्रण का निवारक छिड़काव करें।",
    },
    "Apple Black Rot": {
        "treatment": "Prune infected branches. Apply Thiophanate-methyl.",
        "treatment_hi": "संक्रमित शाखाएं काटें। थियोफेनेट-मिथाइल लगाएं।",
        "organic": "Remove mummified fruits. Spray diluted garlic extract.",
        "organic_hi": "सूखे फल हटाएं। पतला लहसुन अर्क छिड़कें।",
    },
    "Tomato Early Blight": {
        "treatment": "Apply Mancozeb every 7 days. Remove lower infected leaves.",
        "treatment_hi": "हर 7 दिन मैनकोज़ेब छिड़कें। नीचे की संक्रमित पत्तियां हटाएं।",
        "organic": "Spray baking soda solution (1 tsp/L). Improve ventilation.",
        "organic_hi": "बेकिंग सोडा घोल (1 चम्मच/L) छिड़कें। हवा सुधारें।",
    },
    "Bean Rust": {
        "treatment": "Apply Tebuconazole or Propiconazole fungicide.",
        "treatment_hi": "टेबुकोनाज़ोल या प्रोपिकोनाज़ोल फफूंदनाशक छिड़कें।",
        "organic": "Neem oil spray + avoid overhead irrigation.",
        "organic_hi": "नीम तेल छिड़कें + ऊपर से सिंचाई से बचें।",
    },
    "default": {
        "treatment": "Consult your local agriculture department (KVK).",
        "treatment_hi": "अपने स्थानीय कृषि विभाग (KVK) से संपर्क करें।",
        "organic": "Improve crop ventilation and avoid over-irrigation.",
        "organic_hi": "फसल में हवा सुधारें और अधिक सिंचाई से बचें।",
    },
}

_cnn_model = None

def load_model():
    if not TF_AVAILABLE:
        return None
    model_path = os.path.join(
        os.path.dirname(__file__),
        "../ml-models/disease-detection/model/plant_disease_cnn.h5"
    )
    if not os.path.exists(model_path):
        return None
    try:
        return tf.keras.models.load_model(model_path)
    except Exception:
        return None

def preprocess_image(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)


@router.post("/")
async def detect_disease(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files accepted (JPG/PNG)")

    lang = current_user.get("language", "hi")
    image_bytes = await file.read()

    global _cnn_model
    if _cnn_model is None:
        _cnn_model = load_model()

    # If model not available, return smart mock based on image name hint
    if _cnn_model is None or not PIL_AVAILABLE:
        return _mock_detection(lang)

    img_array = preprocess_image(image_bytes)
    predictions = _cnn_model.predict(img_array)[0]
    class_idx = int(np.argmax(predictions))
    confidence = float(predictions[class_idx])

    disease_info = DISEASE_LABELS.get(class_idx, DISEASE_LABELS[4])
    disease_name = disease_info["name"]
    treatment = TREATMENTS.get(disease_name, TREATMENTS["default"])
    is_healthy = "Healthy" in disease_name

    return {
        "disease": disease_info["name_hi"] if lang == "hi" else disease_name,
        "disease_en": disease_name,
        "confidence": round(confidence * 100, 1),
        "is_healthy": is_healthy,
        "treatment": treatment["treatment_hi"] if lang == "hi" else treatment["treatment"],
        "organic_remedy": treatment["organic_hi"] if lang == "hi" else treatment["organic"],
        "severity": "low" if confidence < 0.6 else ("medium" if confidence < 0.85 else "high"),
    }


def _mock_detection(lang: str) -> dict:
    return {
        "disease": "आलू का अगेती झुलसा" if lang == "hi" else "Potato Early Blight",
        "disease_en": "Potato Early Blight",
        "confidence": 87.4,
        "is_healthy": False,
        "treatment": TREATMENTS["Potato Early Blight"]["treatment_hi" if lang == "hi" else "treatment"],
        "organic_remedy": TREATMENTS["Potato Early Blight"]["organic_hi" if lang == "hi" else "organic"],
        "severity": "medium",
        "note": "Demo mode — CNN model not loaded on this server"
    }

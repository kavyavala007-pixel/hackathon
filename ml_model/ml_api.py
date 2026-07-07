from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import joblib
import numpy as np
import os
import re

app = FastAPI(title="Context-Aware Medical AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
DIR = os.path.dirname(__file__)
try:
    model = joblib.load(os.path.join(DIR, "symptom_model.pkl"))
    le = joblib.load(os.path.join(DIR, "label_encoder.pkl"))
    symptoms_list = joblib.load(os.path.join(DIR, "symptoms_list.pkl"))
    context_features = joblib.load(os.path.join(DIR, "context_features.pkl"))
    print("✅ Context-Aware Model Loaded")
except Exception as e:
    print(f"⚠️ Could not load context-aware model: {e}")
    model = None

# Context Keyword Mapping
KEYWORD_MAPPING = {
    'FamilyHistory': ['family', 'history', 'parents', 'hereditary', 'genetics', 'father', 'mother'],
    'HighStress': ['stress', 'anxiety', 'pressure', 'workload', 'tension', 'overwhelmed'],
    'SmokingStatus': ['smoking', 'smoke', 'cigarette', 'tobacco', 'vaping', 'nicotine'],
    'AlcoholUse': ['alcohol', 'drinking', 'wine', 'beer', 'booze', 'liquor']
}

class PredictionRequest(BaseModel):
    age: float
    bmi: float
    symptoms: List[str]
    duration: Optional[float] = 0
    notes: Optional[str] = ""

def extract_context_features(notes: str):
    """Scan notes for medical risk factor keywords"""
    features = {}
    notes_lower = notes.lower()
    for feat, keywords in KEYWORD_MAPPING.items():
        found = any(re.search(rf'\b{kw}\b', notes_lower) for kw in keywords)
        features[feat] = 1 if found else 0
    return features

@app.post("/predict")
def predict(data: PredictionRequest):
    if not model:
        return {"riskScore": 0.5, "predictedDisease": "Model training required.", "confidence": 0}

    # 1. Start with Base Features [Age, BMI, Duration]
    input_vector = [data.age, data.bmi, data.duration or 0]
    
    # 2. Add Contextual Features [FamilyHistory, Stress, Smoking, Alcohol]
    extracted = extract_context_features(data.notes or "")
    for cf in context_features:
        input_vector.append(extracted.get(cf, 0))
    
    # 3. Add Symptom Features
    user_symptoms = [s.strip() for s in data.symptoms]
    for s in symptoms_list:
        input_vector.append(1 if s in user_symptoms else 0)
    
    # Predict
    X = np.array([input_vector])
    
    # Handle Feature Mismatch Gracefully (e.g. if model not yet retrained)
    expected_n = model.n_features_in_
    actual_n = len(input_vector)
    
    if actual_n != expected_n:
        return {
            "error": "Feature Mismatch",
            "message": f"API expects {actual_n} features but loaded model expects {expected_n}. Please run 'python3 train_symptom_model.py'.",
            "predictedDisease": "N/A",
            "riskScore": 0
        }

    encoded_pred = model.predict(X)[0]
    probs = model.predict_proba(X)[0]
    
    diagnosis = str(le.inverse_transform([encoded_pred])[0])
    confidence = float(np.max(probs))
    
    # Detect significant context triggers for the response message
    active_risks = [k for k, v in extracted.items() if v == 1]
    
    return {
        "riskScore": confidence * 0.90 if diagnosis != "Healthy / Baseline" else 0.1,
        "predictedDisease": diagnosis,
        "confidence": round(confidence * 100, 1),
        "contextHighlights": active_risks,
        "durationImpact": "Chronic" if (data.duration or 0) > 21 else "Acute"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
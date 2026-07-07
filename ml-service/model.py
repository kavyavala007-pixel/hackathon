"""
ML Prediction Model (Phase 1 — Rule-based mock)
Will be replaced with a trained scikit-learn / XGBoost model in Phase 2.
"""

from typing import List


# Symptom → disease mapping with risk weights
DISEASE_RULES = [
    {
        "disease": "Type 2 Diabetes",
        "symptoms": ["fatigue", "frequent urination", "excessive thirst", "blurred vision", "slow healing"],
        "bmi_threshold": 27.5,
        "age_factor": 0.003,
        "base_risk": 0.35,
    },
    {
        "disease": "Hypertension",
        "symptoms": ["headache", "dizziness", "chest pain", "shortness of breath", "nosebleed"],
        "bmi_threshold": 25.0,
        "age_factor": 0.004,
        "base_risk": 0.30,
    },
    {
        "disease": "Anemia",
        "symptoms": ["fatigue", "pale skin", "weakness", "shortness of breath", "dizziness"],
        "bmi_threshold": 18.5,
        "age_factor": 0.001,
        "base_risk": 0.20,
    },
    {
        "disease": "Cardiovascular Disease",
        "symptoms": ["chest pain", "shortness of breath", "fatigue", "palpitations", "swollen legs"],
        "bmi_threshold": 28.0,
        "age_factor": 0.005,
        "base_risk": 0.40,
    },
    {
        "disease": "Respiratory Infection",
        "symptoms": ["cough", "fever", "sore throat", "runny nose", "fatigue"],
        "bmi_threshold": 0,
        "age_factor": 0.001,
        "base_risk": 0.25,
    },
]


def predict(age: float, bmi: float, symptoms: List[str]) -> dict:
    symptoms_lower = [s.lower().strip() for s in symptoms]
    best_score = 0.0
    best_disease = "No significant risk detected"

    for rule in DISEASE_RULES:
        matched = sum(1 for s in rule["symptoms"] if s in symptoms_lower)
        symptom_score = matched / max(len(rule["symptoms"]), 1)

        bmi_score = 0.1 if bmi >= rule["bmi_threshold"] else 0.0
        age_score = min(age * rule["age_factor"], 0.2)

        total_score = rule["base_risk"] * symptom_score + bmi_score + age_score
        total_score = min(total_score, 1.0)

        if total_score > best_score:
            best_score = total_score
            best_disease = rule["disease"]

    confidence = round(min(best_score * 100 * 1.2, 95.0), 1)

    return {
        "riskScore": round(best_score, 4),
        "predictedDisease": best_disease,
        "confidence": confidence,
    }

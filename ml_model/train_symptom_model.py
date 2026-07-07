import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import os

# 1. Define the SYMPTOMS (Aligned with HealthForm.jsx)
SYMPTOMS = [
    'Fatigue', 'Headache', 'Dizziness', 'Chest Pain', 'Shortness of Breath',
    'Frequent Urination', 'Excessive Thirst', 'Blurred Vision', 'Slow Healing',
    'Nosebleed', 'Pale Skin', 'Weakness', 'Palpitations', 'Swollen Legs',
    'Cough', 'Fever', 'Sore Throat', 'Runny Nose'
]

# 2. Define the CONTEXTUAL_FEATURES (Extracted from Notes)
CONTEXT_FEATURES = [
    'FamilyHistory',  # family, parents, genetics
    'HighStress',     # stress, anxiety, pressure
    'SmokingStatus',  # smoking, smoke, cigarette
    'AlcoholUse'      # alcohol, drinking, wine
]

# 3. Define the Disease Knowledge Base
DISEASE_KNOWLEDGE = {
    'Type 2 Diabetes': {
        'symptoms': ['Frequent Urination', 'Excessive Thirst', 'Fatigue', 'Blurred Vision', 'Slow Healing'],
        'avg_duration': 60,
        'context_risk': ['FamilyHistory'], # Strong genetic link
    },
    'Hypertension': {
        'symptoms': ['Headache', 'Dizziness', 'Chest Pain', 'Shortness of Breath', 'Nosebleed'],
        'avg_duration': 45,
        'context_risk': ['HighStress', 'SmokingStatus', 'AlcoholUse'],
    },
    'Anemia': {
        'symptoms': ['Fatigue', 'Pale Skin', 'Weakness', 'Shortness of Breath', 'Dizziness'],
        'avg_duration': 30,
        'context_risk': [],
    },
    'Cardiovascular Disease': {
        'symptoms': ['Chest Pain', 'Shortness of Breath', 'Fatigue', 'Palpitations', 'Swollen Legs'],
        'avg_duration': 40,
        'context_risk': ['SmokingStatus', 'FamilyHistory', 'HighStress'],
    },
    'Respiratory Infection': {
        'symptoms': ['Cough', 'Fever', 'Sore Throat', 'Runny Nose', 'Fatigue'],
        'avg_duration': 5,
        'context_risk': ['SmokingStatus'], # Higher risk of severe infection
    },
    'Malaria': {
        'symptoms': ['Fever', 'Weakness', 'Fatigue', 'Palpitations', 'Dizziness'],
        'avg_duration': 7,
        'context_risk': [],
    },
    'Typhoid': {
        'symptoms': ['Fever', 'Weakness', 'Fatigue', 'Headache', 'Dizziness'],
        'avg_duration': 10,
        'context_risk': [],
    },
    'Asthma': {
        'symptoms': ['Shortness of Breath', 'Cough', 'Fatigue', 'Dizziness'],
        'avg_duration': 20,
        'context_risk': ['FamilyHistory', 'SmokingStatus'],
    },
    'Healthy / Baseline': {
        'symptoms': [],
        'avg_duration': 0,
        'context_risk': [],
    }
}

def generate_medical_dataset(n_samples=5000):
    data = []
    diseases = list(DISEASE_KNOWLEDGE.keys())
    
    for _ in range(n_samples):
        # Pick a disease
        disease = np.random.choice(diseases)
        info = DISEASE_KNOWLEDGE[disease]
        key_symptoms = info['symptoms']
        target_duration = info['avg_duration']
        risky_contexts = info['context_risk']
        
        # Demographic signals
        age = np.random.randint(18, 90)
        bmi_base = 28 if disease in ['Type 2 Diabetes', 'Cardiovascular Disease', 'Hypertension'] else 22
        bmi = bmi_base + np.random.normal(0, 4)
        bmi = max(15, min(50, bmi))
        
        # Duration Generation
        if disease == 'Healthy / Baseline':
            duration = np.random.randint(0, 5)
        else:
            duration = max(1, int(np.random.normal(target_duration, target_duration * 0.3)))

        row = {'Age': age, 'BMI': bmi, 'Duration': duration}
        
        # Symptom Generation
        for s in SYMPTOMS:
            prob = 0.90 if s in key_symptoms else 0.05
            row[s] = 1 if np.random.random() < prob else 0
            
        # Context Feature Generation (Risks)
        for cf in CONTEXT_FEATURES:
            # 60% chance if it's a known risk factor for this disease
            prob = 0.60 if cf in risky_contexts else 0.10
            row[cf] = 1 if np.random.random() < prob else 0

        row['Disease'] = disease
        data.append(row)
        
    return pd.DataFrame(data)

def train():
    print("🚀 Generating synthetic medical dataset with CONTEXTUAL AWARENESS...")
    df = generate_medical_dataset()
    
    # Feature columns: [Age, BMI, Duration] + CONTEXT_FEATURES + SYMPTOMS = 3 + 4 + 18 = 25 features
    features = ['Age', 'BMI', 'Duration'] + CONTEXT_FEATURES + SYMPTOMS
    X = df[features]
    y = df['Disease']
    
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Train Model
    print(f"🧠 Training context-aware RandomForest on {len(df)} samples...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y_encoded)
    
    # Save Model components
    print("💾 Exporting updated brain...")
    joblib.dump(model, 'symptom_model.pkl')
    joblib.dump(le, 'label_encoder.pkl')
    joblib.dump(SYMPTOMS, 'symptoms_list.pkl')
    joblib.dump(CONTEXT_FEATURES, 'context_features.pkl')
    
    print("✅ Training Complete with Contextual Awareness!")
    print(f"Diseases covered: {', '.join(le.classes_)}")

if __name__ == "__main__":
    train()

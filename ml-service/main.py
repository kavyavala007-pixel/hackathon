from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from model import predict
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Healthcare ML Service",
    description="Disease prediction API for the AI Healthcare Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    age: float
    bmi: float
    symptoms: List[str]


class PredictResponse(BaseModel):
    riskScore: float
    predictedDisease: str
    confidence: float


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml-service"}


@app.post("/predict", response_model=PredictResponse)
def predict_disease(request: PredictRequest):
    result = predict(
        age=request.age,
        bmi=request.bmi,
        symptoms=request.symptoms,
    )
    return result

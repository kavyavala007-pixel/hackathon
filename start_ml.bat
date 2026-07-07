@echo off
echo Starting ML Prediction Service...
cd ml_model
uvicorn ml_api:app --reload --port 8000
pause

# 🏥 AI-Powered Accessible & Preventive Healthcare Platform

An offline-first, AI-powered preventive healthcare platform with real-time chat, ML-based disease prediction, and hospital discovery.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas URI)
- Python >= 3.10 (for ML service)

### 1. Clone & Install

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# ML Service
cd ml-service && pip install -r requirements.txt
```

### 2. Set Environment Variables

Fill in all `.env` files:
- `backend/.env`
- `frontend/.env` — set `VITE_API_URL` to your backend **including** `/api`, e.g. `http://localhost:5005/api` (not the server root alone).
- `ml-service/.env`

### 3. Seed demo data (recommended)

Loads sample **hospitals** plus **demo** patient & doctor accounts so maps, doctor lists, and chat have something to show.

```bash
cd backend && npm run seed
```

- **Patient:** `demo.patient@medai.local` / `medai123`  
- **Doctor:** `demo.doctor@medai.local` / `medai123`  

Requires a working `MONGODB_URI` in `backend/.env`.

### 4. Run dev servers

```bash
# Backend (PORT from .env, often 5005)
cd backend && npm run dev

# Frontend (Vite — default 5173)
cd frontend && npm run dev

# ML service (port 8000 — set ML_SERVICE_URL in backend/.env)
cd ml-service && python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

In the app, open **Help & setup** (`/help`) for the same checklist.

---

## 📁 Project Structure

```
├── backend/          Node.js + Express + Socket.io
├── backend/scripts/  seedDemoData.js — npm run seed
├── frontend/         React + Vite + PWA
├── ml-service/       Python FastAPI ML predictor
└── .gitignore
```

---

## 🌐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Zustand, React Router v6 |
| Styling | Vanilla CSS (design tokens, dark mode) |
| Offline | IndexedDB (idb), Service Workers (Workbox) |
| Backend | Node.js, Express, ES Modules |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| ML | Python FastAPI |
| Maps | Leaflet + OpenStreetMap (no API key) |

---

## 📋 Development Phases

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Setup, Auth, UI Shells | ✅ |
| 2 | Health Data + ML Predictions | 🔜 |
| 3 | Hospital & Doctor Discovery | 🔜 |
| 4 | Real-Time Chat | 🔜 |
| 5 | Offline System + Sync | 🔜 |

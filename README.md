# FraudShield: AI-Ready Fraud Rule Engine & Transaction Review Console

> **Subtitle:** "Detect. Investigate. Decide."  
> **Domain:** FinTech Fraud Detection & Risk Operations  
> **Architecture:** Decoupled Modular Rule Engine + FastAPI REST API + React 18 Review Workspace

---

## Overview

**FraudShield** is an enterprise-grade financial fraud monitoring platform built for compliance officers, fraud analysts, and risk managers. It evaluates transaction streams against independent, dynamically registered risk detection rules, assigns an explainable risk score (0–100), flags suspicious transactions, triggers high-risk notifications (AWS SES/SNS or local mock provider), and provides a comprehensive investigation workspace.

---

## Repository Structure

```
fraudshield/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # Versioned REST API routes
│   │   ├── core/             # Configuration, logging, security, errors
│   │   ├── database/         # SQLAlchemy models, sessions, migrations
│   │   ├── engine/           # Fraud evaluation engine & risk scoring
│   │   ├── notifications/    # AWS SES, SNS, and Mock providers
│   │   ├── rules/            # Pluggable fraud detection rules
│   │   ├── schemas/          # Pydantic DTOs & request validation
│   │   ├── services/         # Business domain services
│   │   └── main.py           # Application entrypoint
│   ├── tests/                # Pytest unit & integration test suite
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container build
├── frontend/                 # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components & design system
│   │   ├── pages/            # 10 Core application views
│   │   ├── services/         # API client & hooks
│   │   └── App.tsx           # Root router & layout
│   ├── tailwind.config.js    # Design tokens & color system
│   └── Dockerfile            # Multi-stage Nginx container build
├── docs/                     # Engineering documentation
│   ├── ARCHITECTURE.md       # High-level architecture & data flow
│   ├── DATABASE.md           # Schema, ERD, tables & indexes
│   ├── RULE_ENGINE.md        # Modular rule plugin architecture guide
│   ├── API.md                # REST API reference
│   └── SECURITY.md           # Security & compliance standards
├── scripts/                  # Seed scripts & transaction simulators
├── docker-compose.yml        # Orchestration (Postgres + Backend + Frontend)
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## Core Detection Rules
1. **Transaction Velocity Rule**: Flags rapid repeated transactions in short sliding windows (e.g. >5 txns within 10 minutes).
2. **Unusual Transaction Amount Rule**: Flags transactions exceeding dynamic multiples of historical spend averages (e.g. >3x average).
3. **Impossible Geographical Travel Rule**: Calculates Haversine distance and elapsed time between successive transactions to detect physically impossible travel speeds (e.g. Hyderabad to London in 10 minutes).

---

## Getting Started

### Local Development Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ or 20+
- **Docker & Docker Compose** (Optional for containerized run)

### Running Backend Locally
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API documentation available at: `http://localhost:8000/docs`

### Running Frontend Locally
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Running with Docker Compose
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

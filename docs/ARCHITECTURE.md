# FraudShield: System Architecture & Design Specification

> **Subtitle:** "Detect. Investigate. Decide."  
> **Domain:** FinTech Fraud Detection & Risk Intelligence

---

## 1. High-Level Architecture Overview

FraudShield is designed around a decoupled, event-driven, modular pipeline where ingestion, evaluation, decisioning, and review are strictly separated.

```
+----------------------------------------------------------------------------------+
|                                FRAUDSHIELD CLIENT                                |
|   (React 18 + TypeScript + Vite + Tailwind CSS + Lucide + Recharts + Leaflet)    |
+----------------------------------------+-----------------------------------------+
                                         |
                            HTTPS / JSON REST API
                                         |
+----------------------------------------v-----------------------------------------+
|                                FASTAPI BACKEND                                   |
|                                                                                  |
|  +------------------+  +-------------------+  +-------------------------------+  |
|  | Authentication   |  | API Routing Layer |  | Pydantic Input Validation     |  |
|  | (JWT + RBAC)     |  | (/api/v1/...)     |  | (Transactions, Rules, Review) |  |
|  +--------+---------+  +---------+---------+  +---------------+---------------+  |
|           |                      |                            |                  |
|  +--------v----------------------v----------------------------v---------------+  |
|  |                        BUSINESS SERVICE LAYER                              |  |
|  |                                                                            |  |
|  |  +----------------------------------------------------------------------+  |  |
|  |  |                     FRAUD EVALUATION ENGINE                          |  |  |
|  |  |                                                                      |  |  |
|  |  |  +----------------------------------------------------------------+  |  |  |
|  |  |  |                        RULE REGISTRY                           |  |  |  |
|  |  |  |  +-----------------+  +-----------------+  +----------------+  |  |  |  |
|  |  |  |  | VelocityRule    |  | UnusualAmount   |  | Impossible     |  |  |  |  |
|  |  |  |  |                 |  | Rule            |  | TravelRule     |  |  |  |  |
|  |  |  |  +--------+--------+  +--------+--------+  +-------+--------+  |  |  |  |
|  |  |  |           |                    |                   |           |  |  |  |
|  |  |  +-----------v--------------------v-------------------v-----------+  |  |  |
|  |  |                                   |                                  |  |  |
|  |  |                       INDIVIDUAL RULE RESULTS                        |  |  |
|  |  |                                   |                                  |  |  |
|  |  |                       +-----------v------------+                     |  |  |
|  |  |                       |     RISK AGGREGATOR    |                     |  |  |
|  |  |                       |  (Weighted Normalizer) |                     |  |  |
|  |  |                       +-----------+------------+                     |  |  |
|  |  +-----------------------------------|----------------------------------+  |  |
|  |                                      v                                     |  |
|  |                    +-----------------+-----------------+                   |  |
|  |                    |                                   |                   |  |
|  |                    v                                   v                   |  |
|  |         +----------+-----------+           +-----------+-----------+       |  |
|  |         | FraudFlag Generator  |           | Notification Service  |       |  |
|  |         | & Explainable Evidence|          | (Mock / SES / SNS)    |       |  |
|  |         +----------+-----------+           +-----------+-----------+       |  |
|  +--------------------|-----------------------------------|-------------------+  |
+-----------------------|-----------------------------------|----------------------+
                        |                                   |
           SQLAlchemy ORM (Async / Sync)                    |
                        |                                   |
+-----------------------v-----------------------------------v----------------------+
|                     PERSISTENCE & INFRASTRUCTURE                                 |
|                                                                                  |
|  +---------------------+  +----------------------+  +-------------------------+  |
|  | PostgreSQL (Prod)   |  | SQLite (Local Dev)   |  | AWS Cloud / SNS / SES   |  |
|  | Users, Txns, Flags, |  | Zero-conf fallback   |  | Real-time alerts on     |  |
|  | Rules, Audit Logs   |  |                      |  | CRITICAL threshold      |  |
|  +---------------------+  +----------------------+  +-------------------------+  |
+----------------------------------------------------------------------------------+
```

---

## 2. Core Components

### 2.1 Backend Layer (`backend/app`)
- **API Routers**: Clean, versioned REST endpoints (`/api/transactions`, `/api/fraud`, `/api/rules`, `/api/reviews`, `/api/dashboard`, `/api/audit-logs`).
- **Core Engine**: The evaluation pipeline accepts an incoming transaction, loads transaction context (historical spend, rolling windows, prior geolocations), and executes active rules.
- **Rule Registry**: A pluggable, decoupled registry. Every rule implements `BaseRule`. Future rules can be registered without modifying the engine.
- **Risk Aggregator**: Computes normalized risk scores (0–100) and maps them to severity tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Notification Subsystem**: Provider pattern (`BaseNotificationProvider`, `MockNotificationProvider`, `SESProvider`, `SNSProvider`) enabling seamless offline testing and enterprise AWS cloud deployment.
- **Audit Logger**: Tamper-evident logging of every analyst action, rule change, and risk event.

### 2.2 Frontend Layer (`frontend/src`)
- **React 18 + TypeScript + Vite**: Ultra-fast build and reactive state.
- **Tailwind CSS & Design Tokens**: Polished dark/light fintech theme with semantic risk colors.
- **Investigation Workspace**: Three-column analyst workbench featuring visual evidence cards, "Why was this flagged?" explainability waterfall, and Leaflet travel visualization.
- **Executive Dashboard**: Real-time KPI counters, Recharts risk distributions, and review queue trackers.

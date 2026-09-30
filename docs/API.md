# FraudShield: REST API Specification

---

## Base URL
`/api/v1` (or `/api`)

All endpoints return structured JSON with standard envelope and HTTP status codes:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional status message"
}
```

Error response structure:
```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "The requested transaction could not be found.",
    "details": null
  }
}
```

---

## 1. Authentication
- `POST /api/auth/login`: Authenticate analyst/admin and receive JWT Bearer token
- `GET /api/auth/me`: Retrieve currently logged-in user profile & role

---

## 2. Transactions
- `POST /api/transactions`: Ingest & evaluate a transaction in real-time
- `GET /api/transactions`: List transactions with server-side pagination, sorting, search, and filters (date range, user_id, amount range, risk level)
- `GET /api/transactions/{transaction_id}`: Retrieve detailed transaction metadata, evaluation results, and risk flag

---

## 3. Fraud Flags & Investigation
- `GET /api/fraud/flags`: Retrieve queued fraud alerts with filtering by `status` (NEW, UNDER_REVIEW, CONFIRMED_FRAUD, CLEARED, ESCALATED) and `risk_level`
- `GET /api/fraud/flags/{flag_id}`: Deep investigation payload including:
  - Transaction details
  - Prior transaction context (for impossible travel visualization)
  - Historical spend deviation metrics
  - Triggered rules with scores, severity, explanations, and evidence breakdown
  - Review action timeline

---

## 4. Review Actions Workflow
- `POST /api/reviews/{flag_id}/review`: Mark alert as UNDER_REVIEW and assign reviewer
- `POST /api/reviews/{flag_id}/clear`: Clear alert as legitimate / false positive
- `POST /api/reviews/{flag_id}/confirm`: Confirm transaction as fraudulent
- `POST /api/reviews/{flag_id}/escalate`: Escalate alert to higher compliance tier
- `POST /api/reviews/{flag_id}/notes`: Add internal investigation notes

---

## 5. Rules Management
- `GET /api/rules`: List all registered rules, active status, threshold configuration, and trigger statistics
- `POST /api/rules`: Register or define new rule
- `PUT /api/rules/{rule_key}`: Update rule status (enable/disable), weight, or threshold parameters

---

## 6. Executive Dashboard & Metrics
- `GET /api/dashboard/summary`: Return KPI metrics (Total Txns, Today's Txns, Flagged Count, Critical Count, Reviewed Count, System Health)
- `GET /api/dashboard/charts`: Time-series fraud alerts, risk distribution pie chart, top triggered rules breakdown

---

## 7. Audit Logs
- `GET /api/audit-logs`: Audit trail of every system action, user review, rule adjustment, and notification event

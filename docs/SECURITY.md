# FraudShield: Security & FinTech Compliance Architecture

---

## 1. Zero Trust & Sensitive Data Protection
- **No Sensitive Financial Credentials**: FraudShield explicitly refuses to ingest, store, or log Primary Account Numbers (PAN / credit card numbers), CVV/CVC codes, plaintext passwords, or online banking passwords.
- **Tokenization / Reference IDs**: Transactions are referenced via pseudonymous `transaction_id`, `account_id`, and `user_id`.

---

## 2. Authentication & Authorization (RBAC)
- **Password Security**: Passwords hashed with bcrypt using high salt work factor.
- **JWT Security**: Signed with HMAC-SHA256 (`HS256`) using dedicated secret key, with configurable expiry times.
- **Role-Based Access Control**:
  - `ADMIN`: Full access to configure rules, create users, clear/confirm fraud, view audit logs, trigger notifications.
  - `FRAUD_ANALYST`: Query transactions, execute deep investigations, modify rule parameters, assign reviews.
  - `REVIEWER`: Access review queue, mark reviewed, clear alerts, submit notes.

---

## 3. Threat Mitigation
- **SQL Injection Prevention**: 100% parameterized queries via SQLAlchemy ORM; no dynamic raw SQL string interpolation.
- **Cross-Origin Resource Sharing (CORS)**: Restrictive origin whitelist configured via environment variable `CORS_ORIGINS`.
- **Secret Management**: No secrets, AWS keys, or API tokens committed in code. Configured strictly via `.env` or container runtime environment.
- **Audit Logging**: Every sensitive action (alert clearance, fraud confirmation, rule threshold mutation, login attempt) is immutably logged with timestamp, actor, entity, and metadata.
- **Error Sanitization**: Production mode hides internal tracebacks, returning standardized error envelopes with clean machine codes.

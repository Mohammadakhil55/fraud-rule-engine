# FraudShield: Database Architecture & Schema Specification

---

## 1. Relational Entity Overview

The FraudShield database architecture is designed for transactional throughput, strict referential integrity, and efficient historical indexing for sliding-window anomaly detection.

### Entity Relationship Diagram (ERD)

```
       +------------------+
       |      users       |
       +------------------+
       | id (PK)          |
       | email            |<----------------------+
       | full_name        |                       |
       | role             |                       |
       | created_at       |                       |
       +--------+---------+                       |
                | 1                               |
                |                                 |
                | N                               |
       +--------v---------+              +--------+---------+
       |   transactions   |              |  review_actions  |
       +------------------+              +------------------+
       | id (PK)          |              | id (PK)          |
       | transaction_id   |              | fraud_flag_id    |--+
       | user_id (FK)     |              | reviewer_id (FK) |  |
       | amount           |              | action           |  |
       | timestamp        |              | notes            |  |
       | latitude         |              | created_at       |  |
       | longitude        |              +------------------+  |
       | status           |                                    |
       +--------+---------+                                    |
                | 1                                            |
                |                                              |
                | 1                                            |
       +--------v---------+                                    |
       |   fraud_flags    |<-----------------------------------+
       +------------------+
       | id (PK)          |
       | transaction_id   |
       | risk_score       |
       | risk_level       |
       | status           |
       | assigned_to      |
       +--------+---------+
                | 1
                |
                | N
       +--------v---------+
       |   rule_results   |
       +------------------+
       | id (PK)          |
       | fraud_flag_id    |
       | rule_key         |
       | triggered        |
       | score            |
       | explanation      |
       | evidence_json    |
       +------------------+
```

---

## 2. Table Definitions & Indexes

### `users`
- `id`: UUID / Integer Primary Key
- `email`: VARCHAR(255) UNIQUE INDEX
- `full_name`: VARCHAR(255)
- `hashed_password`: VARCHAR(255)
- `role`: ENUM ('ADMIN', 'FRAUD_ANALYST', 'REVIEWER')
- `is_active`: BOOLEAN DEFAULT TRUE
- `created_at`: TIMESTAMP WITH TIME ZONE

### `transactions`
- `id`: UUID / Integer Primary Key
- `transaction_id`: VARCHAR(64) UNIQUE INDEX
- `user_id`: VARCHAR(64) INDEX (ForeignKey users.id or external customer id)
- `account_id`: VARCHAR(64) INDEX
- `amount`: NUMERIC(14, 2) NOT NULL
- `currency`: VARCHAR(3) DEFAULT 'USD'
- `transaction_type`: VARCHAR(32) ('PURCHASE', 'TRANSFER', 'WITHDRAWAL')
- `timestamp`: TIMESTAMP WITH TIME ZONE INDEX (Crucial for velocity window queries)
- `latitude`: FLOAT NULL
- `longitude`: FLOAT NULL
- `merchant_name`: VARCHAR(255)
- `merchant_category`: VARCHAR(64)
- `device_id`: VARCHAR(128) INDEX
- `ip_address`: VARCHAR(45)
- `country`: VARCHAR(64)
- `city`: VARCHAR(128)
- `status`: VARCHAR(32) DEFAULT 'PENDING'
- `created_at`: TIMESTAMP WITH TIME ZONE

### `rule_definitions`
- `id`: UUID / Integer Primary Key
- `rule_key`: VARCHAR(64) UNIQUE INDEX (e.g. `velocity_rule`, `unusual_amount_rule`)
- `name`: VARCHAR(128)
- `description`: TEXT
- `is_active`: BOOLEAN DEFAULT TRUE
- `severity`: VARCHAR(32) ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
- `weight`: FLOAT DEFAULT 1.0
- `config_json`: JSON / TEXT (Configurable thresholds)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### `fraud_flags`
- `id`: UUID / Integer Primary Key
- `transaction_id`: VARCHAR(64) UNIQUE REFERENCES transactions(transaction_id)
- `risk_score`: FLOAT NOT NULL INDEX
- `risk_level`: VARCHAR(32) NOT NULL INDEX ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
- `status`: VARCHAR(32) NOT NULL INDEX ('NEW', 'UNDER_REVIEW', 'CONFIRMED_FRAUD', 'CLEARED', 'ESCALATED')
- `assigned_to`: VARCHAR(255) NULL
- `summary`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE INDEX
- `updated_at`: TIMESTAMP WITH TIME ZONE

### `rule_results`
- `id`: UUID / Integer Primary Key
- `fraud_flag_id`: INTEGER / UUID REFERENCES fraud_flags(id)
- `transaction_id`: VARCHAR(64) INDEX
- `rule_key`: VARCHAR(64) INDEX
- `triggered`: BOOLEAN NOT NULL
- `score`: FLOAT NOT NULL
- `severity`: VARCHAR(32) NOT NULL
- `explanation`: TEXT
- `evidence_json`: JSON / TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

### `review_actions`
- `id`: UUID / Integer Primary Key
- `fraud_flag_id`: INTEGER / UUID REFERENCES fraud_flags(id)
- `reviewer_id`: VARCHAR(255) NOT NULL
- `action`: VARCHAR(32) NOT NULL ('REVIEW', 'CLEAR', 'CONFIRM_FRAUD', 'ESCALATE', 'ADD_NOTE')
- `notes`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

### `notification_logs`
- `id`: UUID / Integer Primary Key
- `fraud_flag_id`: INTEGER / UUID REFERENCES fraud_flags(id)
- `channel`: VARCHAR(32) ('SES_EMAIL', 'SNS_TOPIC', 'MOCK')
- `recipient`: VARCHAR(255)
- `subject`: VARCHAR(255)
- `payload_json`: JSON / TEXT
- `status`: VARCHAR(32) ('SENT', 'FAILED', 'QUEUED')
- `created_at`: TIMESTAMP WITH TIME ZONE

### `audit_logs`
- `id`: UUID / Integer Primary Key
- `actor`: VARCHAR(255) NOT NULL
- `action`: VARCHAR(64) NOT NULL
- `entity`: VARCHAR(64) NOT NULL
- `entity_id`: VARCHAR(128) NOT NULL
- `description`: TEXT NOT NULL
- `metadata_json`: JSON / TEXT
- `timestamp`: TIMESTAMP WITH TIME ZONE INDEX

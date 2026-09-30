# FraudShield Automation Scripts

This directory houses development, simulation, and data generation utilities:

- `seed_data.py`: Pre-populates the database with realistic synthetic customers, normal transactions, velocity attacks, travel anomalies, and high-value deviations.
- `simulate_transactions.py`: Streams live synthetic transactions against the `/api/transactions` endpoint to simulate a production financial stream.

# FraudShield: Modular Fraud Rule Engine Architecture

---

## 1. Design Philosophy

FraudShield implements a **Plugin-Based Strategy Pattern**.
- The core evaluation engine has **zero hardcoded rule logic**.
- All rules inherit from `BaseRule`.
- Rules are dynamically registered in the `RuleRegistry`.
- An incoming transaction is evaluated against all active rules in parallel or sequential pipeline.
- New rules can be added simply by creating a class inheriting `BaseRule` and registering it with `@RuleRegistry.register`.

---

## 2. Base Rule Interface

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class RuleEvaluationResult(BaseModel):
    rule_key: str
    rule_name: str
    triggered: bool
    score: float
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    explanation: str
    evidence: Dict[str, Any]

class BaseRule(ABC):
    rule_key: str
    rule_name: str
    description: str
    default_severity: str
    default_weight: float = 1.0

    @abstractmethod
    def evaluate(self, transaction: Any, context: Any, config: Optional[Dict[str, Any]] = None) -> RuleEvaluationResult:
        """
        Evaluate transaction against rule criteria.
        Returns RuleEvaluationResult with triggered status, score, explanation, and evidence.
        """
        pass
```

---

## 3. Dynamic Rule Registry

```python
class RuleRegistry:
    _registry: Dict[str, BaseRule] = {}

    @classmethod
    def register(cls, rule_cls):
        instance = rule_cls()
        cls._registry[instance.rule_key] = instance
        return rule_cls

    @classmethod
    def get_all_rules(cls) -> Dict[str, BaseRule]:
        return cls._registry
```

---

## 4. How to Add a New Rule in 3 Steps (Zero Core Modifications)

Suppose you want to add a `ForeignCountryRule` that detects when a transaction occurs in a country different from the user's home country or historical profile:

### Step 1: Create `backend/app/rules/foreign_country_rule.py`

```python
from app.rules.base_rule import BaseRule, RuleEvaluationResult
from app.rules.registry import RuleRegistry

@RuleRegistry.register
class ForeignCountryRule(BaseRule):
    rule_key = "foreign_country_rule"
    rule_name = "Foreign Country Transaction"
    description = "Flags transactions originating outside the customer's typical operating countries"
    default_severity = "MEDIUM"
    default_weight = 1.0

    def evaluate(self, transaction, context, config=None) -> RuleEvaluationResult:
        config = config or {"allowed_deviation": False}
        frequent_countries = context.frequent_countries or []

        if frequent_countries and transaction.country not in frequent_countries:
            return RuleEvaluationResult(
                rule_key=self.rule_key,
                rule_name=self.rule_name,
                triggered=True,
                score=45.0,
                severity=self.default_severity,
                explanation=f"Transaction originated in {transaction.country}, which is outside user's frequent countries ({', '.join(frequent_countries)}).",
                evidence={
                    "transaction_country": transaction.country,
                    "frequent_countries": frequent_countries
                }
            )

        return RuleEvaluationResult(
            rule_key=self.rule_key,
            rule_name=self.rule_name,
            triggered=False,
            score=0.0,
            severity="LOW",
            explanation="Transaction is within usual country footprint.",
            evidence={"transaction_country": transaction.country}
        )
```

### Step 2: Import in `backend/app/rules/__init__.py`
That's it! The engine loads all registered rules from `RuleRegistry.get_all_rules()`. The core engine logic (`FraudEngine.evaluate_transaction`) requires no changes whatsoever.

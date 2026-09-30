import math
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.schemas.transaction import TransactionCreate
from app.schemas.evaluation import RuleEvaluationDetail


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees).
    Returns distance in kilometers.
    """
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return 6371.0 * c


class BaseRule(ABC):
    """
    Abstract Base Class for all modular fraud detection rules.
    Subclasses implement deterministic evaluation logic against a transaction
    and its historical context.
    """

    rule_key: str
    rule_name: str
    description: str
    default_severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    default_weight: float = 1.0
    default_config: Dict[str, Any] = {}

    def __init__(
        self,
        weight: Optional[float] = None,
        is_active: bool = True,
        config: Optional[Dict[str, Any]] = None,
    ):
        self.weight = weight if weight is not None else self.default_weight
        self.is_active = is_active
        self.config = {**self.default_config, **(config or {})}

    @abstractmethod
    def evaluate(
        self,
        transaction: TransactionCreate,
        history: Optional[List[TransactionCreate]] = None,
        custom_config: Optional[Dict[str, Any]] = None,
    ) -> RuleEvaluationDetail:
        """
        Evaluate transaction against rule logic.
        Must return a structured RuleEvaluationDetail instance.
        """
        pass

    def get_effective_config(self, override: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not override:
            return self.config
        return {**self.config, **override}

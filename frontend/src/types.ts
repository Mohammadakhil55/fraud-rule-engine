export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RuleEvaluationDetail {
  rule_key: string;
  rule_name: string;
  triggered: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score_contribution: number;
  explanation: string;
  evidence: Record<string, any>;
}

export interface FraudRiskAssessmentResponse {
  assessment_name: string;
  transaction_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  is_flagged: boolean;
  flag_id?: string | null;
  triggered_rules: string[];
  rule_contributions: Record<string, number>;
  explanations: string[];
  evidence: Record<string, any>;
  rule_details: RuleEvaluationDetail[];
  evaluated_at: string;
}

export interface TransactionPayload {
  transaction_id?: string;
  user_id: string;
  account_id?: string;
  amount: number;
  currency: string;
  transaction_type?: string;
  timestamp?: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  country?: string;
  merchant_name?: string;
  merchant_category?: string;
  device_id?: string;
  ip_address?: string;
}

export interface TransactionEvaluationRequest {
  transaction: TransactionPayload;
  save_to_db: boolean;
  history_override?: TransactionPayload[] | null;
}

export interface RuleDefinitionMeta {
  rule_key: string;
  rule_name: string;
  description: string;
  severity: string;
  weight: number;
  is_active: boolean;
  config: Record<string, any>;
}

export interface UserHistoricalTransaction {
  id: string;
  tx_seq: number;
  timestamp: string;
  time_display: string;
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category: string;
  city: string;
  country: string;
  status: 'APPROVED' | 'FLAGGED' | 'REVIEW';
  is_spike?: boolean;
  deviation_percentage?: number;
  notes?: string;
}

export interface CustomerProfileHistory {
  user_id: string;
  user_name: string;
  account_tier: string;
  tenure_months: number;
  baseline_avg_amount: number;
  current_tx: UserHistoricalTransaction;
  transactions_last_10: UserHistoricalTransaction[];
  has_sudden_hike: boolean;
  hike_multiplier?: number;
  hike_percentage?: number;
}

export interface EvaluatedRuleDecision {
  rule_name: string;
  score_contribution: number;
  explanation: string;
}

export interface EvaluatedTransactionRecord {
  id: string;
  timestamp: string;
  time_display: string;
  user_id: string;
  amount: number;
  currency: string;
  merchant_name: string;
  risk_score: number;
  max_score: number;
  risk_level: RiskLevel;
  status: 'FLAGGED' | 'CLEAR';
  review_status: 'PENDING' | 'REVIEWED' | 'CLEARED';
  rule_decisions: EvaluatedRuleDecision[];
}

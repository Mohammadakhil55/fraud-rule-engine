import type { EvaluatedTransactionRecord, FraudRiskAssessmentResponse } from './types';

export const INITIAL_EVALUATED_TRANSACTIONS: EvaluatedTransactionRecord[] = [
  {
    id: 'DEMO-1005',
    timestamp: '2026-09-30T08:17:00.000Z',
    time_display: '30/9/2026, 1:47:00 pm',
    user_id: 'U1001',
    amount: 75000,
    currency: 'INR',
    merchant_name: 'Luxury Merchant',
    risk_score: 100,
    max_score: 100,
    risk_level: 'CRITICAL',
    status: 'FLAGGED',
    review_status: 'PENDING',
    rule_decisions: [
      {
        rule_name: 'Velocity Rule',
        score_contribution: 30,
        explanation: '4 transactions detected within 5 minutes',
      },
      {
        rule_name: 'Unusual Amount Rule',
        score_contribution: 30,
        explanation: 'Amount 75000.00 is more than 5x historical average 825.00',
      },
      {
        rule_name: 'Impossible Geo Rule',
        score_contribution: 40,
        explanation: 'Required travel speed is approximately 463311 km/h for 7722 km',
      },
    ],
  },
  {
    id: 'DEMO-1004',
    timestamp: '2026-09-30T08:16:00.000Z',
    time_display: '30/9/2026, 1:46:00 pm',
    user_id: 'U1001',
    amount: 1200,
    currency: 'INR',
    merchant_name: 'Demo Store',
    risk_score: 0,
    max_score: 100,
    risk_level: 'LOW',
    status: 'CLEAR',
    review_status: 'CLEARED',
    rule_decisions: [],
  },
  {
    id: 'DEMO-1003',
    timestamp: '2026-09-30T08:15:00.000Z',
    time_display: '30/9/2026, 1:45:00 pm',
    user_id: 'U1001',
    amount: 900,
    currency: 'INR',
    merchant_name: 'Demo Store',
    risk_score: 0,
    max_score: 100,
    risk_level: 'LOW',
    status: 'CLEAR',
    review_status: 'REVIEWED',
    rule_decisions: [],
  },
  {
    id: 'DEMO-1002',
    timestamp: '2026-09-30T08:14:00.000Z',
    time_display: '30/9/2026, 1:44:00 pm',
    user_id: 'U1001',
    amount: 700,
    currency: 'INR',
    merchant_name: 'Demo Store',
    risk_score: 0,
    max_score: 100,
    risk_level: 'LOW',
    status: 'CLEAR',
    review_status: 'REVIEWED',
    rule_decisions: [],
  },
  {
    id: 'DEMO-1001',
    timestamp: '2026-09-30T05:18:00.000Z',
    time_display: '30/9/2026, 10:48:00 am',
    user_id: 'U1001',
    amount: 500,
    currency: 'INR',
    merchant_name: 'Demo Store',
    risk_score: 0,
    max_score: 100,
    risk_level: 'LOW',
    status: 'CLEAR',
    review_status: 'CLEARED',
    rule_decisions: [],
  },
];

const STORAGE_KEY = 'fraudshield_evaluated_transactions_v1';

export function loadEvaluatedTransactions(): EvaluatedTransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load evaluated transactions from localStorage:', e);
  }
  return INITIAL_EVALUATED_TRANSACTIONS;
}

export function saveEvaluatedTransactions(records: EvaluatedTransactionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save evaluated transactions to localStorage:', e);
  }
}

export function resetEvaluatedTransactions(): EvaluatedTransactionRecord[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  return INITIAL_EVALUATED_TRANSACTIONS;
}

export function addEvaluationToRecords(
  assessment: FraudRiskAssessmentResponse,
  amount: number,
  currency: string = 'INR',
  merchant: string = 'Retail Merchant',
  userId: string = 'U1001'
): EvaluatedTransactionRecord[] {
  const current = loadEvaluatedTransactions();
  const now = new Date();

  const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;

  const ruleDecisions = assessment.rule_details
    .filter((r) => r.triggered && r.score_contribution > 0)
    .map((r) => ({
      rule_name: r.rule_name,
      score_contribution: Math.round(r.score_contribution),
      explanation: r.explanation,
    }));

  const newRecord: EvaluatedTransactionRecord = {
    id: assessment.transaction_id,
    timestamp: now.toISOString(),
    time_display: formattedDate,
    user_id: userId,
    amount: amount,
    currency: currency,
    merchant_name: merchant,
    risk_score: Math.round(assessment.risk_score),
    max_score: 100,
    risk_level: assessment.risk_level,
    status: assessment.is_flagged ? 'FLAGGED' : 'CLEAR',
    review_status: assessment.is_flagged ? 'PENDING' : 'CLEARED',
    rule_decisions: ruleDecisions,
  };

  const filtered = current.filter((tx) => tx.id !== newRecord.id);
  const updated = [newRecord, ...filtered];
  saveEvaluatedTransactions(updated);
  return updated;
}

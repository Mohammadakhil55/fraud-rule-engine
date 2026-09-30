import type { FraudRiskAssessmentResponse, TransactionEvaluationRequest, RuleDefinitionMeta } from './types';

const API_BASE = '/api';

export async function evaluateTransaction(
  payload: TransactionEvaluationRequest
): Promise<FraudRiskAssessmentResponse> {
  const response = await fetch(`${API_BASE}/transactions/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Evaluation failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function fetchRules(): Promise<RuleDefinitionMeta[]> {
  const response = await fetch(`${API_BASE}/rules`);
  if (!response.ok) {
    throw new Error(`Failed to fetch rules (${response.status})`);
  }
  return response.json();
}

export async function checkBackendHealth(): Promise<{ status: string; service: string; version: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return response.json();
}

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { FraudRiskAssessmentResponse } from '../types';
import { RiskGauge } from './RiskGauge';

interface EvaluationResultViewProps {
  assessment: FraudRiskAssessmentResponse;
}

export const EvaluationResultView: React.FC<EvaluationResultViewProps> = ({ assessment }) => {
  const [showRawEvidence, setShowRawEvidence] = useState(false);

  const getVerdictDetails = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          title: 'CRITICAL FRAUD HOLD',
          message: 'Multiple severe threat vectors identified. Immediate transaction hold and account containment triggered.',
          icon: Flame,
          color: 'text-red-500',
          bg: 'bg-red-500/10 border-red-500/20',
          actionText: 'AUTOMATED FREEZE',
        };
      case 'HIGH':
        return {
          title: 'HIGH RISK ESCALATION',
          message: 'Anomalous physical travel or monetary ceiling breached. Flagged for Priority Fraud Analyst review.',
          icon: ShieldAlert,
          color: 'text-orange-500',
          bg: 'bg-orange-500/10 border-orange-500/20',
          actionText: 'ANALYST REVIEW REQUIRED',
        };
      case 'MEDIUM':
        return {
          title: 'ELEVATED SUSPICION',
          message: 'Moderate risk threshold reached. Secondary factor authentication (2FA) or soft review advised.',
          icon: AlertTriangle,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10 border-amber-500/20',
          actionText: 'STEP-UP AUTHENTICATION',
        };
      case 'LOW':
      default:
        return {
          title: 'TRANSACTION APPROVED',
          message: 'All deterministic rules passed cleanly. Frictionless approval granted.',
          icon: ShieldCheck,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          actionText: 'INSTANT APPROVAL',
        };
    }
  };

  const verdict = getVerdictDetails(assessment.risk_level);
  const VerdictIcon = verdict.icon;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Top Banner & Verdict */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
        {/* Left: Gauge */}
        <div className="flex-shrink-0">
          <RiskGauge score={assessment.risk_score} level={assessment.risk_level} />
        </div>

        {/* Center: Verdict Card */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
              {assessment.assessment_name}
            </span>
            <span className="text-xs text-text-secondary flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {new Date(assessment.evaluated_at).toLocaleTimeString()}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${verdict.bg} flex items-start gap-3.5`}>
            <div className={`p-2 rounded-lg bg-surface border border-border ${verdict.color}`}>
              <VerdictIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">{verdict.title}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${verdict.bg}`}>
                  {verdict.actionText}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{verdict.message}</p>
            </div>
          </div>

          {/* Quick metadata pills */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded-md bg-background border border-border text-text-secondary">
              TXID: <span className="font-bold text-text-primary">{assessment.transaction_id}</span>
            </div>
            {assessment.flag_id && (
              <div className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 font-bold">
                FLAG: {assessment.flag_id}
              </div>
            )}
            <div className="px-2.5 py-1 rounded-md bg-background border border-border text-text-secondary flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>Persisted to DB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Contributions Bar Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center justify-between">
          <span>Rule Points Contribution Breakdown</span>
          <span className="font-mono text-text-primary">{assessment.risk_score} / 100.0 pts</span>
        </h4>

        {/* Visual Progress Stack */}
        <div className="h-3 w-full bg-background rounded-full overflow-hidden flex border border-border">
          {assessment.rule_details.map((rule) => {
            if (!rule.triggered || rule.score_contribution <= 0) return null;
            const widthPct = Math.min((rule.score_contribution / 100) * 100, 100);

            const colorClass =
              rule.rule_key === 'RULE_VELOCITY'
                ? 'bg-amber-500'
                : rule.rule_key === 'RULE_UNUSUAL_AMOUNT'
                ? 'bg-emerald-500'
                : 'bg-blue-500';

            return (
              <div
                key={rule.rule_key}
                style={{ width: `${widthPct}%` }}
                title={`${rule.rule_name}: +${rule.score_contribution} pts`}
                className={`${colorClass} transition-all duration-500`}
              />
            );
          })}
          {assessment.risk_score === 0 && (
            <div className="w-full bg-emerald-500/20 flex items-center justify-center text-[9px] font-mono text-emerald-500">
              0 points added — Clean Profile
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          {assessment.rule_details.map((rule) => (
            <div key={rule.rule_key} className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  rule.rule_key === 'RULE_VELOCITY'
                    ? 'bg-amber-500'
                    : rule.rule_key === 'RULE_UNUSUAL_AMOUNT'
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                }`}
              />
              <span className="text-text-secondary">{rule.rule_name}:</span>
              <span className="font-mono font-semibold">
                {rule.triggered ? `+${rule.score_contribution} pts` : '0 pts'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Explanations & Evidence */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Explainability & Audit Rationale
        </h4>

        {assessment.explanations.length === 0 ? (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>
              All registered rules evaluated clean. Transaction velocity, monetary ceiling, and physical location are consistent with legitimate activity.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {assessment.rule_details
              .filter((r) => r.triggered)
              .map((r) => (
                <div
                  key={r.rule_key}
                  className="p-3.5 rounded-xl border border-border bg-background/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{r.rule_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-surface border border-border">
                      +{r.score_contribution} pts &bull; {r.severity}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{r.explanation}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Factual Evidence Drawer */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setShowRawEvidence(!showRawEvidence)}
          className="flex items-center justify-between w-full text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-1"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            <span>Factual Evidence Telemetry (Audit Log Payload)</span>
          </span>
          {showRawEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawEvidence && (
          <div className="mt-3 p-4 rounded-xl bg-background border border-border overflow-x-auto text-[11px] font-mono space-y-2">
            <div className="text-text-muted">// Immutable evidence emitted by modular rule engine:</div>
            <pre className="text-text-primary">{JSON.stringify(assessment.evidence, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import type { EvaluatedTransactionRecord } from '../types';
import {
  loadEvaluatedTransactions,
  saveEvaluatedTransactions,
  resetEvaluatedTransactions,
} from '../evaluatedTransactionsData';

export const EvaluatedTransactionsView: React.FC = () => {
  const [records, setRecords] = useState<EvaluatedTransactionRecord[]>(() => loadEvaluatedTransactions());
  const [selectedId, setSelectedId] = useState<string>(() => {
    const list = loadEvaluatedTransactions();
    return list.length > 0 ? list[0].id : 'DEMO-1005';
  });
  const [filterState, setFilterState] = useState<'ALL' | 'FLAGGED' | 'PENDING'>('ALL');

  const selectedRecord = records.find((r) => r.id === selectedId) || records[0];

  // Calculated Metric KPIs
  const totalCount = records.length;
  const flaggedCount = records.filter((r) => r.status === 'FLAGGED').length;
  const highRiskCount = records.filter((r) => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL').length;
  const pendingCount = records.filter((r) => r.review_status === 'PENDING').length;

  const handleMarkReviewed = () => {
    if (!selectedRecord) return;
    const updated = records.map((r) =>
      r.id === selectedRecord.id ? { ...r, review_status: 'REVIEWED' as const } : r
    );
    setRecords(updated);
    saveEvaluatedTransactions(updated);
  };

  const handleClearTransaction = () => {
    if (!selectedRecord) return;
    const updated = records.map((r) =>
      r.id === selectedRecord.id
        ? { ...r, status: 'CLEAR' as const, review_status: 'CLEARED' as const }
        : r
    );
    setRecords(updated);
    saveEvaluatedTransactions(updated);
  };

  const handleResetData = () => {
    const reset = resetEvaluatedTransactions();
    setRecords(reset);
    setSelectedId(reset[0]?.id || 'DEMO-1005');
  };

  const displayedRecords = records.filter((r) => {
    if (filterState === 'FLAGGED') return r.status === 'FLAGGED';
    if (filterState === 'PENDING') return r.review_status === 'PENDING';
    return true;
  });

  return (
    <div className="space-y-6 max-w-full">
      {/* Top 4 KPI Metrics matching user's Image 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Transactions */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-1">
          <div className="text-3xl font-extrabold text-text-primary tracking-tight">{totalCount}</div>
          <div className="text-xs text-text-secondary font-medium">Transactions</div>
        </div>

        {/* Metric 2: Flagged */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-1">
          <div className="text-3xl font-extrabold text-text-primary tracking-tight">{flaggedCount}</div>
          <div className="text-xs text-text-secondary font-medium">Flagged</div>
        </div>

        {/* Metric 3: High Risk */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-1">
          <div className="text-3xl font-extrabold text-text-primary tracking-tight">{highRiskCount}</div>
          <div className="text-xs text-text-secondary font-medium">High Risk</div>
        </div>

        {/* Metric 4: Pending Review */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-1">
          <div className="text-3xl font-extrabold text-text-primary tracking-tight">{pendingCount}</div>
          <div className="text-xs text-text-secondary font-medium">Pending Review</div>
        </div>
      </div>

      {/* Main 2-Column Split matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Evaluated Transactions Table (7 of 12 cols) */}
        <div className="lg:col-span-7 bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Evaluated Transactions</h2>
              <p className="text-xs text-text-muted mt-0.5">Click a row to inspect rule decisions.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetData}
                title="Reset to default demo data"
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-surface-hover text-text-muted hover:text-text-primary text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-border/80 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {displayedRecords.map((tx) => {
                  const isSelected = selectedRecord?.id === tx.id;
                  const isCritical = tx.risk_level === 'CRITICAL' || tx.risk_level === 'HIGH';
                  const isPending = tx.review_status === 'PENDING';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedId(tx.id)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-l-brand-500 font-medium'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Reference & Time */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-text-primary">{tx.id}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">{tx.time_display}</div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-2 text-text-secondary font-mono">{tx.user_id}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 font-bold text-text-primary">
                        {tx.currency} {tx.amount.toLocaleString()}
                      </td>

                      {/* Risk (Pill + Score below) */}
                      <td className="py-3.5 px-3">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isCritical
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}
                          >
                            {tx.risk_level}
                          </span>
                          <div className="text-[10px] text-text-muted font-mono mt-0.5">
                            {tx.risk_score}/{tx.max_score}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-2">
                        <span
                          className={`font-bold text-[11px] uppercase ${
                            tx.status === 'FLAGGED'
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      {/* Review */}
                      <td className="py-3.5 px-2 text-right">
                        <span
                          className={`font-bold text-[11px] uppercase ${
                            isPending
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {tx.review_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Selected Transaction Details Inspector (5 of 12 cols) */}
        {selectedRecord && (
          <div className="lg:col-span-5 bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-5">
            {/* Header: Title + Risk Pill Badge matching Image 1 & 3 */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-brand-500 uppercase tracking-wider block font-mono">
                  TRANSACTION
                </span>
                <h3 className="text-2xl font-black text-text-primary tracking-tight mt-0.5">
                  {selectedRecord.id}
                </h3>
              </div>

              {/* Risk Level Circle/Oval Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  selectedRecord.risk_level === 'CRITICAL' || selectedRecord.risk_level === 'HIGH'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                }`}
              >
                {selectedRecord.risk_level}
              </span>
            </div>

            {/* 2x3 Metadata Grid matching Image 1 & 3 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* User */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">USER</span>
                <span className="font-bold text-text-primary text-sm">{selectedRecord.user_id}</span>
              </div>

              {/* Amount */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">AMOUNT</span>
                <span className="font-bold text-text-primary text-sm">
                  {selectedRecord.currency} {selectedRecord.amount.toLocaleString()}
                </span>
              </div>

              {/* Merchant */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">MERCHANT</span>
                <span className="font-bold text-text-primary text-sm truncate block">
                  {selectedRecord.merchant_name}
                </span>
              </div>

              {/* Score */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">SCORE</span>
                <span className="font-bold text-text-primary text-sm">
                  {selectedRecord.risk_score}/{selectedRecord.max_score}
                </span>
              </div>

              {/* Time */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">TIME</span>
                <span className="font-bold text-text-primary text-xs">{selectedRecord.time_display}</span>
              </div>

              {/* Review */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">REVIEW</span>
                <span
                  className={`font-bold text-xs uppercase ${
                    selectedRecord.review_status === 'PENDING'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-text-primary'
                  }`}
                >
                  {selectedRecord.review_status}
                </span>
              </div>
            </div>

            {/* Rule Decisions Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-text-primary">Rule Decisions</h4>

              {selectedRecord.rule_decisions.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedRecord.rule_decisions.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-text-primary">{rule.rule_name}</span>
                        </div>
                        <span className="text-xs font-bold text-red-500 font-mono">
                          +{rule.score_contribution}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary pl-6 leading-relaxed">
                        {rule.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                      All Rules Passed Cleanly
                    </span>
                    <p className="text-[11px] text-text-secondary">
                      No anomalous velocity, amount spikes, or travel violations detected.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons matching Image 1 & 3 */}
            <div className="pt-3 border-t border-border grid grid-cols-2 gap-3">
              {/* Mark Reviewed Button (Blue Solid) */}
              <button
                type="button"
                onClick={handleMarkReviewed}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0f4a8a] hover:bg-[#0b386b] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Reviewed</span>
              </button>

              {/* Clear Transaction Button (Mint/Green Outline) */}
              <button
                type="button"
                onClick={handleClearTransaction}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#257c50] dark:text-emerald-400 bg-[#eef8f3] dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Clear Transaction</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

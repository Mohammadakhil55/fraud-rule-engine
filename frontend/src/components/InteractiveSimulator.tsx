import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Loader2,
  Coffee,
  Gem,
  Zap,
  Plane,
  ShieldAlert,
  ArrowRight,
  FlaskConical,
  Layers,
} from 'lucide-react';
import type { PredefinedScenario } from '../mockScenarios';
import { getMockScenarios } from '../mockScenarios';
import type { FraudRiskAssessmentResponse, TransactionEvaluationRequest } from '../types';
import { evaluateTransaction } from '../api';
import { EvaluationResultView } from './EvaluationResultView';
import { RiskMatrixSection } from './RiskMatrixSection';
import { addEvaluationToRecords } from '../evaluatedTransactionsData';

export const InteractiveSimulator: React.FC = () => {
  const resultRef = useRef<HTMLDivElement>(null);
  const scenarios = getMockScenarios();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');

  // Custom Form state - Defaults in Indian Rupees (INR)
  const [customTxId, setCustomTxId] = useState(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customUserId, setCustomUserId] = useState('user_custom_test');
  const [customAmount, setCustomAmount] = useState(1500.0);
  const [customCurrency, setCustomCurrency] = useState('INR');
  const [customMerchant, setCustomMerchant] = useState('Bengaluru Retail Store');
  const [customCity, setCustomCity] = useState('Bengaluru');
  const [customCountry, setCustomCountry] = useState('India');
  const [customLat, setCustomLat] = useState<string>('12.9716');
  const [customLon, setCustomLon] = useState<string>('77.5946');

  // Velocity injection option in custom mode
  const [simulateVelocityBurst, setSimulateVelocityBurst] = useState(false);
  const [simulateImpossibleTravel, setSimulateImpossibleTravel] = useState(false);

  // Execution state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FraudRiskAssessmentResponse | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Auto-run first scenario on initial load
  useEffect(() => {
    handleRunScenario(scenarios[0], false);
  }, []);

  const handleRunScenario = async (scenario: PredefinedScenario, shouldScroll: boolean = true) => {
    setSelectedScenarioId(scenario.id);
    setLoading(true);
    setError(null);
    setLastFeedback(null);

    try {
      // Visually evident delay so the user clearly sees the evaluating spinner state
      await new Promise((resolve) => setTimeout(resolve, 250));

      const freshScenarios = getMockScenarios();
      const target = freshScenarios.find((s) => s.id === scenario.id) || scenario;
      const res = await evaluateTransaction(target.request);
      setResult(res);

      // Auto-register in Evaluated Transactions Review Console
      addEvaluationToRecords(
        res,
        target.request.transaction.amount,
        target.request.transaction.currency,
        target.request.transaction.merchant_name || 'Retail Merchant',
        target.request.transaction.user_id
      );

      setLastFeedback(
        `Simulation Executed • ${res.transaction_id} evaluated with ${Math.round(res.risk_score)} pts (${res.risk_level}) — ₹${target.request.transaction.amount.toLocaleString()} ${target.request.transaction.currency}`
      );

      if (shouldScroll) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCustom = async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    const historyOverride = [];

    if (simulateVelocityBurst) {
      for (let i = 1; i <= 5; i++) {
        historyOverride.push({
          transaction_id: `TX-BURST-${i}`,
          user_id: customUserId,
          amount: 25.0 + i,
          currency: customCurrency,
          city: customCity,
          country: customCountry,
          timestamp: new Date(now.getTime() - i * 60 * 1000).toISOString(),
        });
      }
    }

    if (simulateImpossibleTravel) {
      historyOverride.push({
        transaction_id: 'TX-PRIOR-REMOTE',
        user_id: customUserId,
        amount: 6500.0,
        currency: 'INR',
        city: 'Tokyo',
        country: 'Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      });
    }

    const payload: TransactionEvaluationRequest = {
      transaction: {
        transaction_id: customTxId,
        user_id: customUserId,
        amount: Number(customAmount),
        currency: customCurrency,
        merchant_name: customMerchant,
        city: customCity,
        country: customCountry,
        latitude: customLat ? parseFloat(customLat) : null,
        longitude: customLon ? parseFloat(customLon) : null,
        timestamp: now.toISOString(),
      },
      save_to_db: true,
      history_override: historyOverride.length > 0 ? historyOverride : null,
    };

    try {
      const res = await evaluateTransaction(payload);
      setResult(res);
      addEvaluationToRecords(
        res,
        Number(customAmount),
        customCurrency,
        customMerchant,
        customUserId
      );
      setLastFeedback(
        `Custom Simulation Executed • ${res.transaction_id} evaluated with ${Math.round(res.risk_score)} pts (${res.risk_level})`
      );
      setCustomTxId(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate custom transaction');
    } finally {
      setLoading(false);
    }
  };

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'normal-lunch':
        return <Coffee className="w-5 h-5 text-emerald-500" />;
      case 'high-value-luxury':
        return <Gem className="w-5 h-5 text-amber-500" />;
      case 'velocity-burst':
        return <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'impossible-travel':
        return <Plane className="w-5 h-5 text-orange-500" />;
      case 'multi-vector-attack':
      default:
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-full">
      {/* Top Banner and Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
              Interactive Risk Evaluation Console
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Simulate live payment payloads through FraudShield&apos;s deterministic decisioning engine.
          </p>
        </div>

        {/* Mode Switcher Buttons - Fully Responsive */}
        <div className="flex-shrink-0 flex items-center p-1 rounded-xl bg-background border border-border text-xs font-medium self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setMode('presets')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'presets'
                ? 'bg-brand-500 text-white shadow-xs font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pre-Configured Scenarios</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'custom'
                ? 'bg-brand-500 text-white shadow-xs font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Custom Lab</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Cards - Responsive grid that avoids horizontal overflow */}
      {mode === 'presets' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          {scenarios.map((s) => {
            const isSelected = selectedScenarioId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => handleRunScenario(s)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-500/10 shadow-sm ring-1 ring-brand-500/30'
                    : 'border-border bg-surface hover:bg-surface-hover hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-surface border border-border shadow-xs">
                      {getScenarioIcon(s.id)}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        s.expectedTier === 'CRITICAL'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          : s.expectedTier === 'HIGH'
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                          : s.expectedTier === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {s.expectedTier}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-text-primary tracking-tight">{s.name}</h3>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      {s.category}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-text-muted">Payload:</span>
                    <span className="font-bold text-text-primary text-xs">
                      ₹{s.request.transaction.amount.toLocaleString()} ({s.request.transaction.currency})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunScenario(s, true);
                    }}
                    disabled={loading}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-brand-500 text-white shadow-xs'
                        : 'bg-background hover:bg-brand-500 hover:text-white border border-border text-text-primary'
                    }`}
                  >
                    {loading && isSelected ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                    <span>{loading && isSelected ? 'Evaluating Rules...' : 'Run Simulation'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom Transaction Lab Form */
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Custom Payload Testing Lab</h3>
              <p className="text-xs text-text-secondary">Simulate any transaction parameter to test rule thresholds.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-background border border-border text-text-muted">
              Auto-Calculated Risk Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={customTxId}
                onChange={(e) => setCustomTxId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">User ID</label>
              <input
                type="text"
                value={customUserId}
                onChange={(e) => setCustomUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Amount ({customCurrency})
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Merchant</label>
              <input
                type="text"
                value={customMerchant}
                onChange={(e) => setCustomMerchant(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                City / Country
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-border bg-background text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-border bg-background text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Latitude / Longitude
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Lat"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Lon"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-border bg-background text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleRunCustom}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Evaluate with API</span>
              </button>
            </div>
          </div>

          {/* Quick Anomaly Checkboxes */}
          <div className="pt-3 border-t border-border flex flex-wrap gap-5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simulateVelocityBurst}
                onChange={(e) => setSimulateVelocityBurst(e.target.checked)}
                className="rounded border-border text-brand-500 focus:ring-brand-500 w-4 h-4"
              />
              <span className="text-text-secondary">Inject 5 prior charges in last 5 mins (Trigger Velocity)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simulateImpossibleTravel}
                onChange={(e) => setSimulateImpossibleTravel(e.target.checked)}
                className="rounded border-border text-brand-500 focus:ring-brand-500 w-4 h-4"
              />
              <span className="text-text-secondary">Inject prior Tokyo charge 15 mins ago (Trigger Travel Speed)</span>
            </label>
          </div>
        </div>
      )}

      {/* Error Callout */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Feedback Banner */}
      {lastFeedback && (
        <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="font-semibold">{lastFeedback}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-300">
            Recorded to Ledger &amp; Review Console
          </span>
        </div>
      )}

      {/* Result View */}
      <div ref={resultRef} className="scroll-mt-24">
        {result && <EvaluationResultView assessment={result} />}
      </div>

      {/* 4 Risk Ranges Grid with Full Matter Directly Below Each Range Pill */}
      <div className="pt-4 border-t border-border">
        <RiskMatrixSection
          onSelectTier={(tier) => {
            const match = scenarios.find((s) => s.expectedTier === tier);
            if (match) handleRunScenario(match);
          }}
        />
      </div>
    </div>
  );
};

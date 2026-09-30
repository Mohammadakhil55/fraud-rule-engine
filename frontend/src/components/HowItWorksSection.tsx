import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Globe2,
  IndianRupee,
  Binary,
  CheckCircle,
  HelpCircle,
  Scale,
  Sparkles,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flow' | 'math' | 'rules' | 'philosophy'>('flow');

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Binary className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">How FraudShield Actually Works</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Deterministic, explainable rule-based risk evaluation for mission-critical FinTech.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-xl bg-background border border-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'flow'
                ? 'bg-surface text-brand-500 shadow-sm font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            4-Stage Pipeline
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rules'
                ? 'bg-surface text-brand-500 shadow-sm font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            The 3 Core Rules
          </button>
          <button
            onClick={() => setActiveTab('math')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'math'
                ? 'bg-surface text-brand-500 shadow-sm font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Scoring Formula
          </button>
          <button
            onClick={() => setActiveTab('philosophy')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'philosophy'
                ? 'bg-surface text-brand-500 shadow-sm font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Why Rules &gt; ML?
          </button>
        </div>
      </div>

      {/* Tab 1: 4-Stage Pipeline */}
      {activeTab === 'flow' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center border border-brand-500/20">
                1
              </span>
              <span className="text-[10px] font-mono text-text-muted">STAGE: INGESTION</span>
            </div>
            <h3 className="font-semibold text-sm">Telemetry Pinning</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Captures transaction payload, currency, exact timestamp, coordinates (latitude/longitude), and loads prior user transaction history.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center border border-brand-500/20">
                2
              </span>
              <span className="text-[10px] font-mono text-text-muted">STAGE: EVALUATION</span>
            </div>
            <h3 className="font-semibold text-sm">Parallel Modular Rules</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every active rule independently tests the transaction against mathematical thresholds without cross-contamination.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center border border-brand-500/20">
                3
              </span>
              <span className="text-[10px] font-mono text-text-muted">STAGE: SYNTHESIS</span>
            </div>
            <h3 className="font-semibold text-sm">Deterministic Scoring</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Aggregates points from all triggered rules, applies configured weights, and strictly clamps between 0.0 and 100.0.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold flex items-center justify-center border border-brand-500/20">
                4
              </span>
              <span className="text-[10px] font-mono text-text-muted">STAGE: ACTION</span>
            </div>
            <h3 className="font-semibold text-sm">Tier Decision & Audit</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Maps score to risk tier (LOW, MEDIUM, HIGH, CRITICAL). Generates human-readable explanations and persists to the fraud database.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: The 3 Core Rules */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rule 1: Velocity */}
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center gap-2 text-brand-500">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-sm">Transaction Velocity</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Identifies card testing and automated botting by checking how many transactions a user submits within a sliding 10-minute window.
            </p>
            <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>&ge; 3 charges / 10m:</span>
                <span className="text-amber-500 font-bold">+35 pts (Warning)</span>
              </div>
              <div className="flex justify-between">
                <span>&ge; 5 charges / 10m:</span>
                <span className="text-orange-500 font-bold">+50 pts (High)</span>
              </div>
              <div className="flex justify-between">
                <span>&ge; 8 charges / 10m:</span>
                <span className="text-red-500 font-bold">+80 pts (Critical)</span>
              </div>
            </div>
          </div>

          {/* Rule 2: Unusual Amount */}
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center gap-2 text-brand-500">
              <IndianRupee className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-sm">Unusual Amount Ceiling</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Flags single transactions exceeding strict monetary safety limits or deviating over 4x above the user&apos;s baseline spending.
            </p>
            <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>&ge; ₹2,500.00:</span>
                <span className="text-amber-500 font-bold">+35 pts (Warning)</span>
              </div>
              <div className="flex justify-between">
                <span>&ge; ₹5,000.00:</span>
                <span className="text-orange-500 font-bold">+45 pts (High)</span>
              </div>
              <div className="flex justify-between">
                <span>&ge; ₹10,000.00:</span>
                <span className="text-red-500 font-bold">+65 pts (Critical)</span>
              </div>
            </div>
          </div>

          {/* Rule 3: Impossible Location */}
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
            <div className="flex items-center gap-2 text-brand-500">
              <Globe2 className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-sm">Impossible Location Travel</h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Computes spherical great-circle distance between consecutive transactions and calculates required travel speed.
            </p>
            <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>Speed &gt; 900 km/h:</span>
                <span className="text-orange-500 font-bold">+55 pts (High)</span>
              </div>
              <div className="flex justify-between">
                <span>Speed &gt; 1,500 km/h:</span>
                <span className="text-red-500 font-bold">+70 pts (Critical)</span>
              </div>
              <div className="text-[10px] text-text-muted mt-1">
                Threshold: Max commercial airliner flight speed (~900 km/h).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Scoring Formula */}
      {activeTab === 'math' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-background border border-border font-mono text-center space-y-2">
            <span className="text-xs uppercase text-text-muted font-bold tracking-wider">
              FraudShield Deterministic Accumulator
            </span>
            <div className="text-base sm:text-lg font-bold text-brand-500">
              Score = min( 100, max( 0, &sum; [ Rule_Score &times; Weight ] ) )
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 space-y-1">
              <div className="text-xs font-bold text-emerald-500">0 – 29 LOW</div>
              <p className="text-[11px] text-text-secondary">Safe. Instant auto-approval with zero friction.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 space-y-1">
              <div className="text-xs font-bold text-amber-500">30 – 59 MEDIUM</div>
              <p className="text-[11px] text-text-secondary">Requires step-up 2FA or soft fraud queue review.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-orange-500/20 bg-orange-500/10 space-y-1">
              <div className="text-xs font-bold text-orange-500">60 – 79 HIGH</div>
              <p className="text-[11px] text-text-secondary">Transaction placed on temporary hold for analyst.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 space-y-1">
              <div className="text-xs font-bold text-red-500">80 – 100 CRITICAL</div>
              <p className="text-[11px] text-text-secondary">Immediate automated freeze and security alert.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Why Rules > ML */}
      {activeTab === 'philosophy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
            <div className="flex items-center gap-2 text-brand-500">
              <Scale className="w-4 h-4 text-emerald-500" />
              <h4 className="font-semibold text-sm">Regulatory Compliance</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Global financial regulations (such as GDPR Art. 22 and FCRA) require an adverse action rationale. FraudShield provides mathematical proof and clear evidence for every decision.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
            <div className="flex items-center gap-2 text-brand-500">
              <CheckCircle className="w-4 h-4 text-brand-500" />
              <h4 className="font-semibold text-sm">Zero Model Drift & Hallucination</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Machine learning models decay over time and produce unpredictable false positives during seasonal shifts (e.g. Black Friday). Deterministic rules execute reliably every single time.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
            <div className="flex items-center gap-2 text-brand-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-sm">Sub-Millisecond Speed</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Because evaluation is pure deterministic arithmetic without heavy tensor calculations or external LLM round-trips, evaluation finishes in under 2 milliseconds.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

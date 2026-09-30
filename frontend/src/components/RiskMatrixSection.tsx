import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Lock,
  Zap,
  Play,
  ArrowRight,
  Info,
} from 'lucide-react';

interface RiskMatrixSectionProps {
  compact?: boolean;
  onSelectTier?: (tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void;
}

export const RiskMatrixSection: React.FC<RiskMatrixSectionProps> = ({
  compact = false,
  onSelectTier,
}) => {
  const [activeTier, setActiveTier] = useState<string>('LOW');

  const tiers = [
    {
      range: '0 - 29 LOW',
      level: 'LOW' as const,
      verdict: 'INSTANT AUTO-APPROVAL',
      pillClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      activeRing: 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10',
      cardClass: 'border-emerald-500/25 bg-emerald-500/5',
      dotColor: 'bg-emerald-500',
      description: 'Clean consumer activity meeting all baseline security criteria. Zero friction.',
      triggers: [
        'Single transaction amount < ₹2,500.00',
        'Normal velocity (1–2 charges in 10 minutes)',
        'Physical travel speed < 900 km/h (plausible location)',
      ],
      action: 'Authorized immediately with 0 customer challenge or delay.',
      example: 'Everyday coffee, groceries, or retail purchases (₹450).',
    },
    {
      range: '30 - 59 MEDIUM',
      level: 'MEDIUM' as const,
      verdict: 'STEP-UP 2FA / SOFT REVIEW',
      pillClass: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      activeRing: 'ring-2 ring-amber-500 shadow-md shadow-amber-500/10',
      cardClass: 'border-amber-500/25 bg-amber-500/5',
      dotColor: 'bg-amber-500',
      description: 'Elevated suspicion. Unusual volume or moderate monetary ceiling reached.',
      triggers: [
        'Transaction value between ₹2,500.00 and ₹4,999.99',
        'Or spending ≥ 4x higher than 10-tx baseline average',
        'Or elevated velocity burst (3 to 4 charges in 10 minutes)',
      ],
      action: 'Prompts SMS OTP / 3DS confirmation. Soft review queue if 2FA passes.',
      example: 'Card-testing micro-burst or high luxury purchase (₹75,000).',
    },
    {
      range: '60 - 79 HIGH',
      level: 'HIGH' as const,
      verdict: 'ANALYST REVIEW & HOLD',
      pillClass: 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400',
      activeRing: 'ring-2 ring-orange-500 shadow-md shadow-orange-500/10',
      cardClass: 'border-orange-500/25 bg-orange-500/5',
      dotColor: 'bg-orange-500',
      description: 'Priority fraud anomaly. Strong likelihood of stolen credentials or remote takeover.',
      triggers: [
        'Impossible travel speed (> 900 km/h flight speed limit)',
        'High single amount between ₹5,000.00 and ₹9,999.99',
        'Or severe velocity burst (5 to 7 charges in 10 minutes)',
      ],
      action: 'Placed on security hold. High-priority case dispatched to Fraud Analyst.',
      example: 'Tokyo charge 15 mins after New Delhi purchase.',
    },
    {
      range: '80 - 100 CRITICAL',
      level: 'CRITICAL' as const,
      verdict: 'IMMEDIATE FREEZE & BLOCK',
      pillClass: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
      activeRing: 'ring-2 ring-red-500 shadow-md shadow-red-500/10',
      cardClass: 'border-red-500/25 bg-red-500/5',
      dotColor: 'bg-red-500',
      description: 'Critical syndicate attack or catastrophic balance draining in progress.',
      triggers: [
        'Multiple compound rules triggered simultaneously',
        'Absolute critical amount ceiling (≥ ₹10,000.00)',
        'Or aggressive bot swarm (≥ 8 charges in 10 minutes)',
      ],
      action: 'Immediate rejection. Account credentials locked, card frozen, audit log created.',
      example: 'Compound bot attack with ₹1,85,000 wire transfer.',
    },
  ];

  return (
    <section className="space-y-4">
      {/* Title matching user's Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-text-muted">
            RISK INDICATOR MATRIX
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Click any range pill below to inspect triggers, system action protocol, and real-world examples.
          </p>
        </div>
        <span className="text-[11px] font-mono text-text-muted hidden sm:inline-block">
          Deterministic 4-Tier Scoring Grid (0–100)
        </span>
      </div>

      {/* 4 Interactive Columns matching user's Image 2 with detailed matter directly below each pill */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((t) => {
          const isActive = activeTier === t.level;

          return (
            <div
              key={t.range}
              onClick={() => setActiveTier(t.level)}
              className={`rounded-2xl border ${t.cardClass} p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all cursor-pointer ${
                isActive ? t.activeRing : 'hover:border-slate-400/40 hover:shadow-sm'
              }`}
            >
              {/* The Top Range Pill matching user's Image 2 - Now an Interactive Clickable Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTier(t.level);
                }}
                className={`w-full p-3 rounded-xl border text-xs font-bold font-mono flex items-center justify-between shadow-xs transition-transform active:scale-98 ${t.pillClass}`}
              >
                <span>{t.range}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${t.dotColor} ${isActive ? 'animate-pulse' : ''}`} />
              </button>

              {/* Matter directly below the green / yellow / orange / red range pill */}
              <div className="space-y-3 flex-1">
                {/* Verdict & Description */}
                <div>
                  <div className="text-[11px] font-mono font-bold text-brand-500 uppercase tracking-wide">
                    {t.verdict}
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                {/* Triggers Breakdown */}
                <div className="pt-2.5 border-t border-border/50 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted block">
                    What Triggers This Range:
                  </span>
                  <ul className="space-y-1 text-[11px] text-text-secondary">
                    {t.triggers.map((trig, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-brand-500 font-bold">&bull;</span>
                        <span>{trig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Real-World Example */}
                <div className="pt-2 border-t border-border/50 text-[11px] space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-text-muted block">
                    FinTech Example:
                  </span>
                  <p className="text-text-secondary italic text-xs leading-snug">
                    &ldquo;{t.example}&rdquo;
                  </p>
                </div>
              </div>

              {/* System Protocol Box at Bottom */}
              <div className="pt-2.5 border-t border-border/50 text-[11px] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-text-muted block">
                  System Action Protocol:
                </span>
                <p className="text-text-primary font-medium leading-snug">
                  {t.action}
                </p>

                {onSelectTier && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTier(t.level);
                    }}
                    className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-background hover:bg-brand-500 hover:text-white border border-border text-[11px] font-semibold text-text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test {t.level} in Simulator</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

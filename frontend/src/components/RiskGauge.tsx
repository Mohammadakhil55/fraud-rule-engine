import React from 'react';
import type { RiskLevel } from '../types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Gauge Geometry: 240 degree sweep from 8 o'clock (240°) to 4 o'clock (120°)
  // Center: (100, 85), Radius: 68
  // Start: (41.1, 119), End: (158.9, 119)
  const arcLength = 284.84;
  const strokeDashoffset = arcLength - (arcLength * clampedScore) / 100;

  const getColors = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'CRITICAL':
        return {
          stroke: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.25)',
          badgeBg: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
        };
      case 'HIGH':
        return {
          stroke: '#f97316',
          glow: 'rgba(249, 115, 22, 0.25)',
          badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
        };
      case 'MEDIUM':
        return {
          stroke: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.25)',
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        };
      case 'LOW':
      default:
        return {
          stroke: '#10b981',
          glow: 'rgba(16, 185, 129, 0.25)',
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        };
    }
  };

  const style = getColors(level);

  return (
    <div className="flex flex-col items-center justify-center select-none w-48">
      {/* SVG Arc Container */}
      <div className="relative w-48 h-36 flex items-center justify-center">
        <svg
          viewBox="0 0 200 145"
          className="w-full h-full overflow-visible"
        >
          {/* Background Track Arc */}
          <path
            d="M 41.1 119 A 68 68 0 1 1 158.9 119"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Active Risk Score Arc */}
          <path
            d="M 41.1 119 A 68 68 0 1 1 158.9 119"
            fill="none"
            stroke={style.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${style.glow})`,
            }}
          />
        </svg>

        {/* Center Score & Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pointer-events-none">
          <span className="text-4xl font-extrabold tracking-tight font-mono text-text-primary">
            {clampedScore.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
            Risk Points
          </span>
        </div>
      </div>

      {/* Tier Badge with safe clearance */}
      <div
        className={`mt-2 px-3 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase shadow-sm transition-all duration-300 ${style.badgeBg}`}
      >
        {level} RISK ({level === 'LOW' ? '0–29' : level === 'MEDIUM' ? '30–59' : level === 'HIGH' ? '60–79' : '80–100'})
      </div>
    </div>
  );
};

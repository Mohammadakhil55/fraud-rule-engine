import React, { useState, useEffect } from 'react';
import { Sliders, Cpu, CheckCircle2, Shield, Settings, Info } from 'lucide-react';
import type { RuleDefinitionMeta } from '../types';
import { fetchRules } from '../api';

export const RuleRegistryView: React.FC = () => {
  const [rules, setRules] = useState<RuleDefinitionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules()
      .then((data) => setRules(data))
      .catch((err) => console.error('Failed to load rules:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Active Rule Engine Registry</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Registered modular detection rules currently executing inside FraudShield&apos;s evaluation kernel.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 text-xs font-mono font-medium">
          {rules.length} Rules Registered
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted text-xs font-mono">
          Querying backend /api/rules endpoint...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.rule_key}
              className="p-5 rounded-xl border border-border bg-background/50 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-border text-brand-500">
                    {rule.rule_key}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      rule.severity === 'CRITICAL'
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                        : rule.severity === 'HIGH'
                        ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    DEFAULT: {rule.severity}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-text-primary">{rule.rule_name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{rule.description}</p>
              </div>

              {/* Config Parameter inspector */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-text-muted">Engine Weight:</span>
                  <span className="font-bold text-text-primary">{rule.weight.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-text-muted">Execution Status:</span>
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-border font-mono text-[10px] text-text-secondary space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                    Active Parameters:
                  </div>
                  {Object.entries(rule.config).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span>{k}:</span>
                      <span className="font-bold text-text-primary">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extensibility callout */}
      <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 text-xs text-text-secondary flex items-start gap-3">
        <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-text-primary">Modular Zero-Core Modification Architecture</span>
          <p className="leading-relaxed">
            New custom fraud rules (e.g. Device Fingerprinting, VPN Detection, Cryptographic Card Match) can be subclassed from <code className="text-brand-500 font-mono">BaseRule</code> and registered dynamically with <code className="text-brand-500 font-mono">engine.register_rule()</code> without altering the core evaluation engine or database schemas.
          </p>
        </div>
      </div>
    </section>
  );
};

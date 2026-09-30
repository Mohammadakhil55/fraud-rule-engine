import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { getCustomerProfileHistory } from '../customerHistoryData';
import type { CustomerProfileHistory } from '../types';

interface TransactionHistoryViewProps {
  initialUserId?: string;
  currentAmount?: number;
  currentMerchant?: string;
  currentCity?: string;
  currentCountry?: string;
  embedded?: boolean; // if embedded inside the evaluation view
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  initialUserId = 'bob_collector_44',
  currentAmount,
  currentMerchant,
  currentCity,
  currentCountry,
  embedded = false,
}) => {
  const [selectedPresetUser, setSelectedPresetUser] = useState<string>(initialUserId);

  const profile: CustomerProfileHistory = getCustomerProfileHistory(
    selectedPresetUser,
    currentAmount,
    currentMerchant,
    currentCity,
    currentCountry
  );

  const [selectedTxId, setSelectedTxId] = useState<string>(() => {
    return profile.transactions_last_10[profile.transactions_last_10.length - 1]?.id || 'TX-BOB-CURRENT';
  });

  const [reviewStatusMap, setReviewStatusMap] = useState<Record<string, 'PENDING' | 'REVIEWED' | 'CLEARED'>>({
    'TX-BOB-CURRENT': 'PENDING',
    'TX-SYN-CURRENT': 'PENDING',
  });

  const handleUserChange = (newUser: string) => {
    setSelectedPresetUser(newUser);
    const newProfile = getCustomerProfileHistory(newUser, currentAmount, currentMerchant, currentCity, currentCountry);
    const lastTx = newProfile.transactions_last_10[newProfile.transactions_last_10.length - 1];
    if (lastTx) {
      setSelectedTxId(lastTx.id);
    }
  };

  const selectedTx =
    profile.transactions_last_10.find((t) => t.id === selectedTxId) ||
    profile.transactions_last_10[profile.transactions_last_10.length - 1];

  // Format data for Recharts
  const chartData = profile.transactions_last_10.map((tx) => ({
    name: tx.tx_seq === 10 ? '#10 (Current)' : `#${tx.tx_seq}`,
    seq: tx.tx_seq,
    time: tx.time_display,
    amount: tx.amount,
    merchant: tx.merchant_name,
    city: tx.city,
    isSpike: tx.is_spike,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-surface border border-border shadow-xl text-xs space-y-1 font-sans">
          <div className="flex items-center justify-between gap-4 font-mono font-bold text-text-primary">
            <span>{data.name}</span>
            <span className="text-text-secondary">{data.time}</span>
          </div>
          <div className="text-base font-extrabold text-brand-500 font-mono">
            ₹{data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-text-secondary text-[11px]">
            {data.merchant} &bull; {data.city}
          </div>
          {data.isSpike && (
            <div className="mt-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-[10px] uppercase">
              🚨 Sudden Hike Anomaly
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${embedded ? '' : 'p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-sm'}`}>
      {/* Header & Customer Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold tracking-tight">Customer Timeline &amp; Sudden Hike Analysis</h3>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Historical 10-transaction behavioral baseline vs current transaction anomaly detection.
          </p>
        </div>

        {/* Preset Selector */}
        {!embedded && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted hidden sm:inline">Select Customer:</span>
            <select
              value={selectedPresetUser}
              onChange={(e) => handleUserChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="bob_collector_44">Robert (Bob) M. — 91x Sudden Spike (₹75,000)</option>
              <option value="syndicate_vip_99">Victor S. — Extreme Corporate Spike (₹1,85,000)</option>
              <option value="alice_austin_12">Alice W. — Normal Flat Baseline (₹450)</option>
            </select>
          </div>
        )}
      </div>

      {/* Customer Profile Mini Banner */}
      <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text-primary">{profile.user_name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-secondary">
                {profile.account_tier}
              </span>
            </div>
            <span className="text-xs text-text-muted font-mono">UID: {profile.user_id} &bull; Account Age: {profile.tenure_months} months</span>
          </div>
        </div>

        {/* Sudden Hike Banner */}
        {profile.has_sudden_hike ? (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              SUDDEN HIKE: {profile.hike_multiplier}x Normal Baseline (+{profile.hike_percentage?.toLocaleString()}%)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Normal Flat Baseline (Zero Sudden Spikes Detected)</span>
          </div>
        )}
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">10-Tx Baseline Avg</span>
          <div className="text-lg font-extrabold font-mono text-text-primary">
            ₹{profile.baseline_avg_amount.toFixed(2)}
          </div>
          <span className="text-[10px] text-text-secondary">Historical median</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Current Transaction</span>
          <div className={`text-lg font-extrabold font-mono ${profile.has_sudden_hike ? 'text-red-500' : 'text-text-primary'}`}>
            ₹{profile.current_tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-text-secondary">Tx #10 (Latest)</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Sudden Hike Factor</span>
          <div className={`text-lg font-extrabold font-mono ${profile.has_sudden_hike ? 'text-orange-500' : 'text-emerald-500'}`}>
            {profile.has_sudden_hike ? `${profile.hike_multiplier}x` : '1.0x (Normal)'}
          </div>
          <span className="text-[10px] text-text-secondary">
            {profile.has_sudden_hike ? `+${profile.hike_percentage?.toLocaleString()}%` : 'Stable curve'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Anomaly Severity</span>
          <div className="text-lg font-extrabold">
            <span
              className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                profile.has_sudden_hike
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}
            >
              {profile.has_sudden_hike ? 'CRITICAL SPIKE' : 'BENIGN PROFILE'}
            </span>
          </div>
          <span className="text-[10px] text-text-secondary">
            {profile.has_sudden_hike ? 'Rule Triggered' : 'Clean pattern'}
          </span>
        </div>
      </div>

      {/* Visual Recharts Area Chart: 10 Transactions Trend with Sudden Hike */}
      <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Sequential 10-Transaction Spending Trend &amp; Sudden Spike
            </h4>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-red-500 border border-red-500 border-dashed" />
              <span className="text-text-muted">Avg Baseline (₹{profile.baseline_avg_amount.toFixed(2)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-text-muted">Transaction Amount</span>
            </div>
          </div>
        </div>

        {/* The Recharts Curve */}
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={profile.has_sudden_hike ? '#ef4444' : '#3b82f6'}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={profile.has_sudden_hike ? '#ef4444' : '#3b82f6'}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={profile.baseline_avg_amount}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Baseline Avg (₹${profile.baseline_avg_amount.toFixed(0)})`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={profile.has_sudden_hike ? '#ef4444' : '#3b82f6'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendGradient)"
                dot={(props: any) => {
                  const isSpike = props.payload.isSpike;
                  return (
                    <circle
                      key={`dot-${props.cx}-${props.cy}`}
                      cx={props.cx}
                      cy={props.cy}
                      r={isSpike ? 6 : 3.5}
                      fill={isSpike ? '#ef4444' : '#3b82f6'}
                      stroke={isSpike ? '#ffffff' : 'transparent'}
                      strokeWidth={isSpike ? 2 : 0}
                      className={isSpike ? 'animate-ping origin-center' : ''}
                      style={{ filter: isSpike ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))' : 'none' }}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spike Callout Indicator */}
        {profile.has_sudden_hike && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center justify-between font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>SUDDEN HIKE ANOMALY: Tx #10 spiked to ₹{profile.current_tx.amount.toLocaleString()}</span>
            </span>
            <span className="font-bold">+{profile.hike_percentage?.toLocaleString()}% Deviation</span>
          </div>
        )}
      </div>

      {/* 2-Column Ledger & Live Review Decision Console matching user's Image 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Transaction Ledger (7 of 12 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Customer Transaction Ledger (Last 10 Records)
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Click any row below to inspect rule decisions &amp; submit review on the right side.
              </p>
            </div>
            <span className="text-[11px] font-mono text-text-secondary hidden sm:inline">
              Sorted Chronologically
            </span>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background/80 border-b border-border text-[11px] font-mono text-text-muted uppercase">
                  <tr>
                    <th className="p-3">Seq #</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Tx ID</th>
                    <th className="p-3">Merchant</th>
                    <th className="p-3 text-right">Amount (INR / ₹)</th>
                    <th className="p-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-sans">
                  {profile.transactions_last_10.map((tx) => {
                    const isCurrent = tx.tx_seq === 10;
                    const isSelected = selectedTx?.id === tx.id;
                    const review = reviewStatusMap[tx.id] || (tx.is_spike ? 'PENDING' : 'CLEARED');

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTxId(tx.id)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-l-brand-500 font-medium'
                            : tx.is_spike
                            ? 'bg-red-500/5 hover:bg-red-500/10'
                            : 'hover:bg-surface-hover text-text-secondary'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold">
                          {isCurrent ? (
                            <span className="px-1.5 py-0.5 rounded bg-brand-500 text-white text-[10px]">
                              #10 (NOW)
                            </span>
                          ) : (
                            `#${tx.tx_seq}`
                          )}
                        </td>
                        <td className="p-3">
                          {tx.is_spike && review !== 'CLEARED' ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" />
                              SUDDEN HIKE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              APPROVED
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          <div className="font-bold text-text-primary">{tx.id}</div>
                          <div className="text-[10px] text-text-muted">{tx.time_display}</div>
                        </td>
                        <td className="p-3 text-text-primary font-medium">
                          <div className="truncate max-w-[140px]">{tx.merchant_name}</div>
                          <div className="text-[10px] text-text-muted">{tx.city}</div>
                        </td>
                        <td className={`p-3 font-mono text-right font-bold ${tx.is_spike ? 'text-red-500 text-sm' : 'text-text-primary'}`}>
                          ₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          {tx.deviation_percentage && tx.deviation_percentage > 0 ? (
                            <div className="text-[10px] text-red-500 font-normal">
                              +{tx.deviation_percentage.toLocaleString()}%
                            </div>
                          ) : null}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              review === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : review === 'REVIEWED'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {review}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Transaction Inspection & Decision Review Panel matching user's Image 1 */}
        {selectedTx && (
          <div className="lg:col-span-5 bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-5 lg:sticky lg:top-20">
            {/* Header: Title + Risk Badge matching Image 1 */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-brand-500 uppercase tracking-wider block font-mono">
                  TRANSACTION
                </span>
                <h3 className="text-2xl font-black text-text-primary tracking-tight mt-0.5">
                  {selectedTx.id}
                </h3>
              </div>

              {/* Risk Level Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  selectedTx.is_spike && reviewStatusMap[selectedTx.id] !== 'CLEARED'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                }`}
              >
                {selectedTx.is_spike && reviewStatusMap[selectedTx.id] !== 'CLEARED' ? 'CRITICAL' : 'LOW'}
              </span>
            </div>

            {/* 2x3 Metadata Grid matching Image 1 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* User */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">USER</span>
                <span className="font-bold text-text-primary text-sm font-mono truncate block">
                  {selectedPresetUser}
                </span>
              </div>

              {/* Amount */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">AMOUNT</span>
                <span className="font-bold text-text-primary text-sm font-mono">
                  INR ₹{selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Merchant */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">MERCHANT</span>
                <span className="font-bold text-text-primary text-sm truncate block">
                  {selectedTx.merchant_name}
                </span>
              </div>

              {/* Score */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">SCORE</span>
                <span className="font-bold text-text-primary text-sm font-mono">
                  {selectedTx.is_spike && reviewStatusMap[selectedTx.id] !== 'CLEARED' ? '85/100' : '0/100'}
                </span>
              </div>

              {/* Time */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">TIME</span>
                <span className="font-bold text-text-primary text-xs">{selectedTx.time_display}</span>
              </div>

              {/* Review */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-border/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">REVIEW</span>
                <span
                  className={`font-bold text-xs uppercase ${
                    (reviewStatusMap[selectedTx.id] || (selectedTx.is_spike ? 'PENDING' : 'CLEARED')) === 'PENDING'
                      ? 'text-amber-600 dark:text-amber-400'
                      : (reviewStatusMap[selectedTx.id] === 'REVIEWED')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {reviewStatusMap[selectedTx.id] || (selectedTx.is_spike ? 'PENDING' : 'CLEARED')}
                </span>
              </div>
            </div>

            {/* Rule Decisions Section matching Image 1 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-text-primary">Rule Decisions</h4>

              {selectedTx.is_spike && reviewStatusMap[selectedTx.id] !== 'CLEARED' ? (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-text-primary">Unusual Amount Rule</span>
                      </div>
                      <span className="text-xs font-bold text-red-500 font-mono">+45</span>
                    </div>
                    <p className="text-[11px] text-text-secondary pl-6 leading-relaxed">
                      Amount ₹{selectedTx.amount.toLocaleString()} is {profile.hike_multiplier}x higher than 10-tx baseline average (₹{profile.baseline_avg_amount}).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-text-primary">Velocity / Geographical Rule</span>
                      </div>
                      <span className="text-xs font-bold text-red-500 font-mono">+40</span>
                    </div>
                    <p className="text-[11px] text-text-secondary pl-6 leading-relaxed">
                      Sudden geographical shift to {selectedTx.city}, {selectedTx.country} deviating from regular domestic merchant history.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                      All Rules Passed Cleanly
                    </span>
                    <p className="text-[11px] text-text-secondary">
                      No anomalous velocity, amount spikes, or travel violations detected for this transaction.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons matching Image 1 */}
            <div className="pt-3 border-t border-border grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setReviewStatusMap((prev) => ({ ...prev, [selectedTx.id]: 'REVIEWED' }));
                }}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0f4a8a] hover:bg-[#0b386b] active:scale-98 transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Reviewed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReviewStatusMap((prev) => ({ ...prev, [selectedTx.id]: 'CLEARED' }));
                }}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-[#257c50] dark:text-emerald-400 bg-[#eef8f3] dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Clear Transaction</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

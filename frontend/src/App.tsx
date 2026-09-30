import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Server,
  Database,
  Cpu,
  Lock,
  Sparkles,
  Binary,
  Layers,
  Activity,
  AlertTriangle,
  PlayCircle,
  TrendingUp,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { InteractiveSimulator } from './components/InteractiveSimulator';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { HowItWorksSection } from './components/HowItWorksSection';
import { RuleRegistryView } from './components/RuleRegistryView';
import { RiskMatrixSection } from './components/RiskMatrixSection';
import { checkBackendHealth } from './api';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'history' | 'how-it-works' | 'registry' | 'scaffold'>('history');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    checkBackendHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));

    const interval = setInterval(() => {
      checkBackendHealth()
        .then(() => setBackendStatus('online'))
        .catch(() => setBackendStatus('offline'));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'simulator',
      label: 'Risk Simulator',
      subtitle: 'Live Evaluation Console',
      icon: PlayCircle,
      badge: 'Interactive',
    },
    {
      id: 'history',
      label: '10-Tx History & Spike',
      subtitle: 'Behavioral Sudden Hike',
      icon: TrendingUp,
      badge: 'Sudden Spike',
    },
    {
      id: 'how-it-works',
      label: 'How It Works',
      subtitle: '4-Stage Architecture',
      icon: Binary,
    },
    {
      id: 'registry',
      label: 'Rule Engine Registry',
      subtitle: 'Active Weights & Rules',
      icon: Cpu,
    },
    {
      id: 'scaffold',
      label: 'Architecture Overview',
      subtitle: 'Core Scaffold Pillars',
      icon: Layers,
    },
  ];

  return (
    <div className="min-h-screen flex bg-background text-text-primary transition-colors duration-200">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-surface border-r border-border flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 shadow-sm">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">FraudShield</h1>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-bold border border-brand-500/20">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">Enterprise Rule Engine</p>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-hover md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Engine Status Pill */}
          <div
            className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
              backendStatus === 'online'
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : backendStatus === 'offline'
                ? 'bg-red-500/5 border-red-500/20 text-red-500'
                : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                Engine Kernel
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'offline'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
              />
            </div>
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>{backendStatus === 'online' ? 'FastAPI Port 8000' : 'Disconnected'}</span>
              <span className="text-[10px] uppercase">{backendStatus}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-3 py-1">
              Console Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                    <div>
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-text-muted'}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-border space-y-4">
          <div className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-text-secondary space-y-1">
            <div className="flex justify-between">
              <span>Rule Model:</span>
              <span className="font-bold text-text-primary">Deterministic</span>
            </div>
            <div className="flex justify-between">
              <span>Latency:</span>
              <span className="text-emerald-500 font-bold">&lt; 2 ms</span>
            </div>
            <div className="flex justify-between">
              <span>DB Sync:</span>
              <span className="font-bold text-text-primary">SQLite Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-surface-hover text-xs font-medium text-text-secondary transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-brand-500" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <span className="text-[10px] font-mono text-text-muted">&copy; 2026 FraudShield</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Right Side) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto w-full">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-border text-text-secondary hover:bg-surface-hover md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                FraudShield Console / {navItems.find((n) => n.id === activeTab)?.label}
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
                {navItems.find((n) => n.id === activeTab)?.subtitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-medium font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Engine Active</span>
            </div>
          </div>
        </header>

        {/* Tab Content Display */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Tab 1: Interactive Simulator */}
          {activeTab === 'simulator' && <InteractiveSimulator />}

          {/* Tab 2: Customer 10-Tx History & Sudden Spike (With Integrated Review Panel) */}
          {activeTab === 'history' && <TransactionHistoryView />}

          {/* Tab 3: How It Works */}
          {activeTab === 'how-it-works' && <HowItWorksSection />}

          {/* Tab 4: Rule Engine Registry */}
          {activeTab === 'registry' && <RuleRegistryView />}

          {/* Tab 5: Scaffold Overview */}
          {activeTab === 'scaffold' && (
            <div className="space-y-6">
              <section className="p-8 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
                <div className="inline-block px-3 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-mono font-medium">
                  &quot;Detect. Investigate. Decide.&quot;
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">Enterprise FinTech Fraud Prevention</h2>
                <p className="text-text-secondary max-w-3xl leading-relaxed text-sm">
                  FraudShield provides an extensible, modular rule engine paired with an explainable risk scoring matrix
                  and deep investigation workspace. Built for high-throughput FinTech operations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                    <div className="flex items-center justify-between text-brand-500">
                      <Cpu className="w-5 h-5" />
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Modular Rule Engine</h3>
                    <p className="text-xs text-text-muted">Zero core engine modification for new detection rules.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                    <div className="flex items-center justify-between text-brand-500">
                      <Database className="w-5 h-5" />
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Dual DB Persistence</h3>
                    <p className="text-xs text-text-muted">PostgreSQL ready with zero-conf SQLite for local development.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                    <div className="flex items-center justify-between text-brand-500">
                      <Server className="w-5 h-5" />
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-sm">FastAPI &amp; Async REST</h3>
                    <p className="text-xs text-text-muted">High performance, type-safe API with automatic OpenAPI docs.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                    <div className="flex items-center justify-between text-brand-500">
                      <Lock className="w-5 h-5" />
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-sm">FinTech Security &amp; RBAC</h3>
                    <p className="text-xs text-text-muted">Audit logging, no sensitive PAN storage, sanitized outputs.</p>
                  </div>
                </div>
              </section>

              <RiskMatrixSection onSelectTier={() => setActiveTab('simulator')} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

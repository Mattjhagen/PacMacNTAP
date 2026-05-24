import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HardDrive, CircleDollarSign, Wifi, Activity, AlertTriangle, ArrowRight, RefreshCw, X, MessageSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService, UserProfile } from '../services/authService';
import { usageService, UsageReport } from '../services/usageService';
import { supportService, BlockedCallLog } from '../services/supportService';
import { billingService } from '../services/billingService';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UsageReport | null>(null);
  const [scams, setScams] = useState<BlockedCallLog[]>([]);
  const [activeScam, setActiveScam] = useState<BlockedCallLog | null>(null);
  
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticsLog, setDiagnosticsLog] = useState<string[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from service layer
    async function loadDashboardData() {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setProfile(user);

      const usageData = await usageService.getUsageData(user.id);
      setUsage(usageData);

      const scamLogs = await supportService.getSpamBlockedLogs();
      setScams(scamLogs);
    }

    loadDashboardData();
  }, [navigate]);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  const runNetworkDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnosticsLog([]);
    
    const logs = await supportService.runNetworkDiagnostics();
    
    // Animate display in console
    logs.forEach((logText, idx) => {
      setTimeout(() => {
        setDiagnosticsLog(prev => [...prev, logText]);
        if (idx === logs.length - 1) {
          setIsDiagnosing(false);
        }
      }, (idx + 1) * 600);
    });
  };

  if (!profile || !usage) return null;

  const billingInfo = billingService.getSavingsInfo(usage.dataUsedGb);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24 font-sans font-light">
      {/* Background ambient lighting */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[70vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 md:pt-40">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500 block">
              Member Console
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1">
              Hi, {profile.name || 'Member'}.
            </h1>
            <p className="mt-1 text-xs text-brand-gray-400 font-mono">
              Line: {profile.phone || 'eSIM Profile'} • Status: On-Grid
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-xs font-mono border border-white/10 hover:border-white/20 rounded hover:bg-white/5 transition-all self-start md:self-auto cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Dashboard Grid (Spotify Wrapped style layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8">
          
          {/* Card 1: Data Circle Gauge (4 cols) */}
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/40 rounded-xl p-6 flex flex-col justify-between items-center text-center">
            <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                Data Volume
              </span>
              <HardDrive className="w-3.5 h-3.5 text-brand-gray-500" />
            </div>

            {/* Circular Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center my-6">
              <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-neutral-900 fill-none"
                  strokeWidth="6"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-white fill-none transition-all duration-1000"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - usage.dataUsedGb / usage.dataCapGb)}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-display font-semibold text-white">
                  {usage.dataUsedGb.toFixed(1)}
                </span>
                <span className="text-[10px] text-brand-gray-500 font-mono">
                  of {usage.dataCapGb} GB Cap
                </span>
              </div>
            </div>

            <div className="w-full text-left space-y-2 border-t border-white/5 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-gray-400">Cycle Remaining</span>
                <span className="font-mono text-white">{usage.daysRemaining} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray-400">Wi-Fi (Unbilled)</span>
                <span className="font-mono text-white">{usage.wifiGb.toFixed(1)} GB</span>
              </div>
            </div>
          </div>

          {/* Card 2: Adaptive Savings Sparkline (4 cols) */}
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/40 rounded-xl p-6 flex flex-col justify-between">
            <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                Adaptive Savings
              </span>
              <CircleDollarSign className="w-3.5 h-3.5 text-brand-gray-500" />
            </div>

            <div className="my-6">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-wider block">
                Retained Monthly Margins
              </span>
              <span className="text-4xl sm:text-5xl font-display font-semibold text-white mt-1 block glow-sm">
                ${billingInfo.savings.toFixed(2)}
              </span>
              <p className="text-xs text-brand-gray-400 leading-relaxed font-light mt-3">
                Since PacMac automatically scales your rate down, you've saved <strong className="text-white font-normal">${billingInfo.savings.toFixed(2)}</strong> this cycle compared to flat-rate competitor pricing.
              </p>
            </div>

            {/* Savings logs sparkline bars */}
            <div className="flex items-end justify-between h-8 gap-1 mt-4">
              {[25, 45, 15, 30, 20, 60, 40, 22, 35, 50, 28, 48].map((val, idx) => (
                <div
                  key={idx}
                  className="w-full bg-white/20 hover:bg-white rounded-t-sm transition-colors"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: PackieAI caller security (4 cols) */}
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/40 rounded-xl p-6 flex flex-col justify-between">
            <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                PackieAI Call Filter
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gray-500" />
            </div>

            <div className="my-4 text-center py-4 bg-white/[0.01] border border-white/5 rounded-lg">
              <span className="text-3xl font-display font-semibold text-white block">
                {scams.length}
              </span>
              <span className="text-[9px] font-mono text-brand-gray-400 uppercase tracking-widest mt-1 block">
                Scams Intercepted
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-wider block">
                Blocked Transcripts
              </span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {scams.map((scam) => (
                  <button
                    key={scam.id}
                    onClick={() => setActiveScam(scam)}
                    className="w-full text-left p-2 bg-neutral-900 border border-white/5 rounded text-[10px] hover:border-white/20 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-mono text-brand-gray-300 truncate max-w-[130px]">{scam.caller}</span>
                    <span className="text-[8px] text-brand-gray-500 font-mono">{scam.timestamp}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic and charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* Signal Diagnostics (Left 7 cols) */}
          <div className="lg:col-span-7 border border-white/5 bg-neutral-950/40 rounded-xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest">
                  Diagnostic terminal
                </h3>
                <p className="text-[10px] text-brand-gray-500 font-mono mt-0.5">Cell APN Handshake & SIM Verification</p>
              </div>

              <button
                onClick={runNetworkDiagnostics}
                disabled={isDiagnosing}
                className="px-3.5 py-1.5 text-[10px] font-mono border border-white/10 hover:border-white/20 rounded hover:bg-white/5 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                {isDiagnosing ? "Diagnosing..." : "Run diagnostics"}
              </button>
            </div>

            <div className="bg-neutral-950 border border-white/10 rounded-lg p-5 font-mono text-xs space-y-2 min-h-[160px] flex flex-col justify-end text-left shadow-inner">
              {diagnosticsLog.length === 0 && !isDiagnosing && (
                <p className="text-brand-gray-500 italic">Select 'Run diagnostics' to review line telemetry...</p>
              )}

              {diagnosticsLog.map((log, idx) => (
                <p key={idx} className="text-brand-gray-300">
                  <span className="text-brand-gray-600 mr-2">&gt;</span>
                  {log}
                </p>
              ))}

              {isDiagnosing && (
                <div className="flex items-center gap-2 text-brand-gray-500 mt-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking cell spectrum pathways...</span>
                </div>
              )}
            </div>
          </div>

          {/* Wi-Fi vs Cellular charts (Right 5 cols) */}
          <div className="lg:col-span-5 border border-white/5 bg-neutral-950/40 rounded-xl p-8 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest">
                Usage Trends
              </h3>
              <p className="text-[10px] text-brand-gray-500 font-mono mt-0.5">Wi-Fi vs Cellular Balance</p>
            </div>

            <div className="space-y-4">
              {/* Daily bars */}
              {usage.trends.map((item, idx) => {
                const totalGb = item.cellularGb + item.wifiGb;
                const cellPercent = totalGb > 0 ? (item.cellularGb / totalGb) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-brand-gray-400">
                      <span>{item.day}</span>
                      <span>Cell: {item.cellularGb.toFixed(1)}GB • Wi-Fi: {item.wifiGb.toFixed(1)}GB</span>
                    </div>
                    {/* Visual bar split */}
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden flex">
                      <div className="bg-white h-full transition-all" style={{ width: `${cellPercent}%` }} />
                      <div className="bg-neutral-700 h-full transition-all flex-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expandable transcripts */}
        <AnimatePresence>
          {activeScam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-xl bg-neutral-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-neutral-950">
                  <div>
                    <h4 className="text-sm font-semibold text-white font-mono truncate max-w-[280px]">
                      {activeScam.caller}
                    </h4>
                    <p className="text-[10px] text-brand-gray-500 font-mono mt-0.5">
                      {activeScam.type} • {activeScam.timestamp}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveScam(null)}
                    className="p-1 rounded hover:bg-white/5 text-brand-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-sans">
                  {activeScam.dialog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${
                        msg.speaker === 'packie' ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <span className="text-[8px] font-mono text-brand-gray-500 mb-1 uppercase">
                        {msg.speaker === 'packie' ? 'PackieAI Shield' : 'Caller'}
                      </span>
                      <div
                        className={`p-3 rounded-lg leading-relaxed ${
                          msg.speaker === 'packie'
                            ? 'bg-neutral-900 border border-white/10 text-white font-light'
                            : 'bg-white/5 text-brand-gray-300 font-light'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 text-center">
                  <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest block">
                    📞 Intercepted Call Transcript Record
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

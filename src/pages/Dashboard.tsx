import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HardDrive, CircleDollarSign, Wifi, Activity, AlertTriangle, ArrowRight, RefreshCw, X, MessageSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usageService, UsageReport } from '../services/usageService';
import { supportService, BlockedCallLog } from '../services/supportService';
import { billingService } from '../services/billingService';
import { supabase, isLiveDb } from '../utils/supabaseClient';
import { wirelessOsService } from '../services/wirelessOsService';

export default function Dashboard() {
  const { user, signOut, refreshSession } = useAuth();
  const profile = user;
  const [usage, setUsage] = useState<UsageReport | null>(null);
  const [scams, setScams] = useState<BlockedCallLog[]>([]);
  const [activeScam, setActiveScam] = useState<BlockedCallLog | null>(null);
  const [device, setDevice] = useState<any | null>(null);
  
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticsLog, setDiagnosticsLog] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [wirelessOsVersion, setWirelessOsVersion] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Fetch data from service layer
    async function loadDashboardData() {
      setDataLoading(true);
      setDashboardError(null);
      try {
        const usageData = await usageService.getUsageData(user!.id);
        setUsage(usageData);

        const scamLogs = await supportService.getSpamBlockedLogs(user!.id);
        setScams(scamLogs);

        // Load registered device data
        const { data: dbDevices } = await supabase
          .from('devices')
          .select()
          .eq('profile_id', user!.id);
        
        if (dbDevices && dbDevices.length > 0) {
          // Sort by newest created device
          setDevice(dbDevices[dbDevices.length - 1]);
        } else {
          setDevice({
            brand: user!.device ? user!.device.split(' ')[0] : 'Unlocked',
            model: user!.device ? user!.device.split(' ').slice(1).join(' ') : 'Phone',
            sim_type: 'eSIM',
            activation_readiness: 'Ready (eSIM)'
          });
        }
      } catch (err: any) {
        console.warn('Failed to load dashboard data:', err);
        setDashboardError("We couldn't refresh your usage data right now. Displaying cached information.");
        
        // Fallback static metrics to keep interface stable during outage
        if (!usage) {
          setUsage({
            dataUsedGb: 8.4,
            dataCapGb: 30,
            daysRemaining: 12,
            wifiGb: 42.1,
            cellularGb: 8.4,
            trends: [
              { day: 'Mon', cellularGb: 1.2, wifiGb: 5.4 },
              { day: 'Tue', cellularGb: 0.9, wifiGb: 4.8 },
              { day: 'Wed', cellularGb: 1.5, wifiGb: 6.2 },
              { day: 'Thu', cellularGb: 1.1, wifiGb: 5.9 },
              { day: 'Fri', cellularGb: 2.1, wifiGb: 7.1 },
              { day: 'Sat', cellularGb: 0.8, wifiGb: 6.5 },
              { day: 'Sun', cellularGb: 0.8, wifiGb: 6.2 }
            ]
          });
        }
      } finally {
        setDataLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  // Real-time Supabase updates listener
  useEffect(() => {
    if (!user) return;

    if (isLiveDb) {
      // Subscribe to profile modifications
      const profileChannel = supabase
        .channel('dashboard-profile-updates')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          () => {
            refreshSession();
          }
        )
        .subscribe();

      // Subscribe to registered devices changes
      const deviceChannel = supabase
        .channel('dashboard-device-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'devices', filter: `profile_id=eq.${user.id}` },
          async () => {
            const { data: dbDevices } = await supabase
              .from('devices')
              .select()
              .eq('profile_id', user.id);
            if (dbDevices && dbDevices.length > 0) {
              setDevice(dbDevices[dbDevices.length - 1]);
            }
          }
        )
        .subscribe();

      // Subscribe to caller logs changes
      const logsChannel = supabase
        .channel('dashboard-logs-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'packie_logs', filter: `profile_id=eq.${user.id}` },
          async () => {
            const scamLogs = await supportService.getSpamBlockedLogs(user.id);
            setScams(scamLogs);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profileChannel);
        supabase.removeChannel(deviceChannel);
        supabase.removeChannel(logsChannel);
      };
    } else {
      // Emulator mode updates listener
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'pacmac_user_session' || e.key === 'pacmac_user_devices') {
          refreshSession();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [user, refreshSession]);

  useEffect(() => {
    const handler = () => setWirelessOsVersion((version) => version + 1);
    window.addEventListener('pacmac-wireless-os-change', handler);
    return () => window.removeEventListener('pacmac-wireless-os-change', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
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
          sessionStorage.setItem('pacmac_last_diagnostics', new Date().toISOString());
        }
      }, (idx + 1) * 600);
    });
  };

  if (dataLoading || !user || !usage) {
    return (
      <div className="relative min-h-screen bg-black text-white overflow-hidden pb-16 sm:pb-24 font-sans font-light">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[70vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
        <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

        <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 sm:pt-32 md:pt-40 animate-pulse">
          {/* Skeleton Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
            <div className="space-y-3">
              <div className="h-3.5 w-24 bg-neutral-900 rounded" />
              <div className="h-7 w-48 bg-neutral-800 rounded" />
              <div className="h-4.5 w-80 bg-neutral-900 rounded" />
            </div>
            <div className="h-9 w-24 bg-neutral-900 border border-white/5 rounded" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8">
            <div className="md:col-span-4 border border-white/5 bg-neutral-950/20 rounded-xl p-6 h-72 flex flex-col justify-between items-center" />
            <div className="md:col-span-4 border border-white/5 bg-neutral-950/20 rounded-xl p-6 h-72 flex flex-col justify-between" />
            <div className="md:col-span-4 border border-white/5 bg-neutral-950/20 rounded-xl p-6 h-72 flex flex-col justify-between" />
          </div>

          {/* Skeleton diagnostics and charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 border border-white/5 bg-neutral-950/20 rounded-xl p-8 h-80" />
            <div className="lg:col-span-5 border border-white/5 bg-neutral-950/20 rounded-xl p-8 h-80" />
          </div>
        </main>
      </div>
    );
  }

  const billingInfo = billingService.getSavingsInfo(usage.dataUsedGb);
  const wirelessCustomer = wirelessOsService.getCustomer(user.email);
  const wirelessEstimate = wirelessOsService.getInvoiceEstimate(wirelessCustomer.id);
  const wirelessState = wirelessOsService.getState();
  const customerAlerts = wirelessState.fraudAlerts.filter((alert) => alert.customerId === wirelessCustomer.id);
  const customerBlockedNumbers = wirelessState.blockedNumbers.filter((blocked) => blocked.customerId === wirelessCustomer.id);
  void wirelessOsVersion;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-16 sm:pb-24 font-sans font-light">
      {/* Background ambient lighting */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[70vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 sm:pt-32 md:pt-40">
        
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
              Line: {profile.phone || 'eSIM Profile'} • Status: On-Grid • Device: {device ? `${device.brand} ${device.model} (${device.sim_type})` : (profile.device || 'Unlocked Phone')}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-xs font-mono border border-white/10 hover:border-white/20 rounded hover:bg-white/5 transition-all self-start md:self-auto cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {dashboardError && (
          <div className="mb-8 border border-yellow-500/10 bg-yellow-950/5 p-4 rounded-xl flex items-center justify-between text-xs text-brand-gray-400 font-mono select-none">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
              {dashboardError}
            </span>
            <button
              onClick={() => setDashboardError(null)}
              className="text-[9px] font-semibold text-brand-gray-500 hover:text-white transition-colors uppercase cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* eSIM Activation Continuity Banner */}
        {profile?.status === 'pending_activation' && (
          <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-1 z-10">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-white/10 text-white uppercase tracking-wider">
                Pending Activation
              </span>
              <h2 className="text-lg font-display font-medium text-white pt-2">
                Your eSIM profile is ready.
              </h2>
              <p className="text-xs text-brand-gray-400 font-light max-w-xl">
                Scan your QR code to configure network access and activate your line on this device.
              </p>
            </div>
            <button
              onClick={() => navigate('/esim')}
              className="px-5 py-2.5 text-xs font-mono bg-white text-black hover:bg-neutral-200 transition-all rounded-lg font-medium shadow-md hover:shadow-lg flex items-center gap-2 self-start md:self-auto cursor-pointer z-10 shrink-0"
            >
              Scan QR Code
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-7 border border-white/5 bg-neutral-950/40 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 mb-5">
              <div>
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                  PacMac Wireless OS
                </span>
                <h2 className="font-display text-xl font-semibold text-white mt-1">
                  Usage-based billing, live this cycle
                </h2>
              </div>
              <span className="rounded border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[10px] font-mono text-emerald-200 uppercase">
                {wirelessCustomer.accountStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">Data Used</span>
                <strong className="block mt-2 text-2xl font-display text-white">{wirelessEstimate.usageGb.toFixed(1)} GB</strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">Estimated Bill</span>
                <strong className="block mt-2 text-2xl font-display text-white">${wirelessEstimate.estimatedCharge.toFixed(2)}</strong>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">SIM/eSIM</span>
                <strong className="block mt-2 text-2xl font-display text-white capitalize">{wirelessCustomer.simStatus}</strong>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-mono text-brand-gray-500 uppercase tracking-widest mb-2">
                <span>$30 cap progress</span>
                <span>{wirelessEstimate.capProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                  style={{ width: `${wirelessEstimate.capProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-white/5 bg-neutral-950/40 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 mb-4">
              <div>
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                  PackieAI Protection
                </span>
                <h2 className="font-display text-xl font-semibold text-white mt-1">
                  Alerts and blocked numbers
                </h2>
              </div>
              <Shield className="w-5 h-5 text-cyan-200" />
            </div>

            <div className="space-y-3 max-h-64 overflow-auto pr-1">
              {customerAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded border border-white/5 bg-black/20 p-3 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-white">{alert.callerNumber}</span>
                    <span className="font-mono uppercase text-cyan-200">{alert.riskLevel}</span>
                  </div>
                  <p className="text-brand-gray-400 mt-1">{alert.notes}</p>
                </div>
              ))}
              {customerAlerts.length === 0 && (
                <p className="text-xs text-brand-gray-400">No PackieAI alerts this cycle.</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                Blocked Numbers
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {customerBlockedNumbers.map((blocked) => (
                  <button
                    key={blocked.id}
                    onClick={() => {
                      wirelessOsService.unblockNumber(blocked.id);
                      setWirelessOsVersion((version) => version + 1);
                    }}
                    className="rounded border border-red-300/20 bg-red-300/10 px-2 py-1 text-[10px] font-mono text-red-100"
                  >
                    {blocked.phoneNumber}
                  </button>
                ))}
                {customerBlockedNumbers.length === 0 && (
                  <span className="text-xs text-brand-gray-400">No blocked numbers.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid (Spotify Wrapped style layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8">
          
          {/* Card 1: Data Circle Gauge (4 cols) */}
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/40 rounded-xl p-6 flex flex-col justify-between items-center text-center hover:border-white/10 transition-all">
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
                  strokeWidth="4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-white fill-none transition-all duration-1000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - usage.dataUsedGb / usage.dataCapGb)}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-display font-semibold text-white">
                  {usage.dataUsedGb.toFixed(1)}
                </span>
                <span className="text-[10px] text-brand-gray-500 font-mono mt-0.5">
                  of {usage.dataCapGb} GB Cap
                </span>
              </div>
            </div>

            <div className="w-full text-left space-y-3 border-t border-white/5 pt-4 text-xs font-light">
              <p className="text-[11px] text-brand-gray-400 leading-normal">
                Nice pacing. You're set to auto-downscale at cycle end, keeping billing minimal.
              </p>
              <div className="flex justify-between border-t border-white/[0.02] pt-2 text-[10px] font-mono text-brand-gray-500">
                <span>Cycle Remaining</span>
                <span className="text-white">{usage.daysRemaining} days</span>
              </div>
            </div>
          </div>

          {/* Card 2: Adaptive Savings (4 cols) */}
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/40 rounded-xl p-6 flex flex-col justify-between hover:border-white/10 transition-all">
            <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                Adaptive Savings
              </span>
              <CircleDollarSign className="w-3.5 h-3.5 text-brand-gray-500" />
            </div>

            <div className="my-6">
              <span className="text-5xl font-display font-semibold text-white tracking-tight block">
                ${billingInfo.savings.toFixed(2)}
              </span>
              <span className="text-[10px] text-brand-gray-400 font-mono mt-1 block">
                Saved this billing cycle
              </span>
              <p className="text-xs text-brand-gray-400 leading-relaxed font-light mt-4">
                Instead of forcing a high flat rate, PacMac continuously scales your billing down to match your actual footprint. No waste, just quiet returns.
              </p>
            </div>

            {/* Savings logs sparkline bars */}
            <div className="flex items-end justify-between h-8 gap-1 mt-4 border-t border-white/5 pt-4">
              {[25, 45, 15, 30, 20, 60, 40, 22, 35, 50, 28, 48].map((val, idx) => (
                <div
                  key={idx}
                  className="w-full bg-white/10 hover:bg-white/40 rounded-t-sm transition-colors"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: PackieAI (4 cols) */}
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/40 rounded-xl p-6 flex flex-col justify-between hover:border-white/10 transition-all">
            <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                PackieAI Security
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gray-500" />
            </div>

            <div className="my-6">
              <span className="text-5xl font-display font-semibold text-white tracking-tight block">
                {scams.length}
              </span>
              <span className="text-[10px] text-brand-gray-400 font-mono mt-1 block">
                Scams auto-intercepted
              </span>
              <p className="text-xs text-brand-gray-400 leading-relaxed font-light mt-4">
                Our active filter silently intercepts robotic spam before it reaches your handset. Your digital space remains quiet and undisturbed.
              </p>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="space-y-1 max-h-[75px] overflow-y-auto pr-1">
                {scams.map((scam) => (
                  <button
                    key={scam.id}
                    onClick={() => setActiveScam(scam)}
                    className="w-full text-left p-1.5 bg-neutral-900 border border-white/5 rounded text-[9px] hover:border-white/20 transition-all flex items-center justify-between cursor-pointer font-mono"
                  >
                    <span className="text-brand-gray-300 truncate max-w-[120px]">{scam.caller}</span>
                    <span className="text-brand-gray-500">{scam.timestamp}</span>
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
                  Diagnostics Ledger
                </h3>
                <p className="text-[10px] text-brand-gray-500 font-mono mt-0.5">APN Status & Signal Verifier</p>
              </div>

              <button
                onClick={runNetworkDiagnostics}
                disabled={isDiagnosing}
                className="px-3.5 py-1.5 text-[10px] font-mono border border-white/10 hover:border-white/20 rounded hover:bg-white/5 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                {isDiagnosing ? "Verifying..." : "Verify Line Integrity"}
              </button>
            </div>

            <div className="bg-neutral-950 border border-white/5 rounded-lg p-5 font-mono text-[11px] space-y-2 min-h-[160px] flex flex-col justify-end text-left shadow-inner">
              {diagnosticsLog.length === 0 && !isDiagnosing && (
                <p className="text-brand-gray-500 italic">Select 'Verify Line Integrity' to query live cell telemetry...</p>
              )}

              {diagnosticsLog.map((log, idx) => (
                <p key={idx} className="text-brand-gray-400">
                  <span className="text-brand-gray-700 mr-2">✔</span>
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

          {/* Wi-Fi vs Cellular split (Right 5 cols) - Spotify Wrapped style */}
          <div className="lg:col-span-5 border border-white/5 bg-neutral-950/40 rounded-xl p-8 space-y-6 flex flex-col justify-between min-h-[296px]">
            <div className="border-b border-white/5 pb-4">
              <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest">
                Traffic Balance
              </h3>
              <p className="text-[10px] text-brand-gray-500 font-mono mt-0.5">Wi-Fi vs Cellular insights</p>
            </div>

            {(() => {
              const totalGb = usage.wifiGb + usage.cellularGb;
              const wifiPercent = totalGb > 0 ? (usage.wifiGb / totalGb) * 100 : 80;
              const cellPercent = totalGb > 0 ? (usage.cellularGb / totalGb) * 100 : 20;

              return (
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-end justify-between font-display">
                    <div>
                      <span className="text-4xl font-semibold text-white">{wifiPercent.toFixed(0)}%</span>
                      <span className="text-[10px] text-brand-gray-500 font-mono block uppercase tracking-wider mt-0.5">Wi-Fi Traffic</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-semibold text-brand-gray-300">{cellPercent.toFixed(0)}%</span>
                      <span className="text-[10px] text-brand-gray-500 font-mono block uppercase tracking-wider mt-0.5">Cellular Traffic</span>
                    </div>
                  </div>

                  {/* Sleek horizontal balance bar */}
                  <div className="h-3 w-full bg-neutral-900 rounded-full overflow-hidden flex p-[1.5px] border border-white/5">
                    <div className="bg-white h-full rounded-l-full transition-all" style={{ width: `${wifiPercent}%` }} />
                    <div className="bg-neutral-600 h-full rounded-r-full transition-all flex-1" />
                  </div>

                  <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                    You've offloaded the vast majority of your traffic to Wi-Fi. This keeps your cellular footprint light and maintains your rate in the lowest possible billing band.
                  </p>
                </div>
              );
            })()}
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

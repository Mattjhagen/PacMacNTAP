import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Shield, ShieldCheck, RefreshCw, LogIn, Lock, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export default function CustomerDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Logged in by default to preview
  const [phoneNumber, setPhoneNumber] = useState<string>('555-019-4820');
  const [passcode, setPasscode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState([
    { id: 1, type: 'SMS Blocked', content: 'IRS spoof warning: IRS requesting iTunes cards for tax payment.', time: '10:14 AM' },
    { id: 2, type: 'Call Terminated', content: 'Robocall: Auto warranty renewal request block.', time: '9:30 AM' },
    { id: 3, type: 'SMS Blocked', content: 'Suspicious link: Bank account lock notification.', time: 'Yesterday' }
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
    }, 1200);
  };

  const handleTriggerReset = () => {
    alert("Simulated Tower Sync sequence initiated! MNO profile successfully synchronized.");
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Light gradient glow */}
      <div className="absolute right-1/4 top-1/4 w-[450px] h-[350px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-center min-h-[65vh]">
        
        {!isLoggedIn ? (
          /* LOGIN MOCK CARD */
          <div className="w-full max-w-md border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md text-left space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                CARRIER PORTAL // LOGIN
              </span>
              <h3 className="font-display text-2xl font-bold text-white">
                Enter your cell number.
              </h3>
              <p className="text-xs text-brand-gray-400 font-sans font-light">
                No password required. We'll send a 4-digit code to authorize access.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Phone Number</label>
                <input
                  type="text"
                  placeholder="555-019-4820"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Passcode</label>
                <input
                  type="password"
                  placeholder="••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-center text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Access Account Console
              </button>
            </form>
          </div>
        ) : (
          /* ACTUAL CUSTOMER PORTAL VIEW */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* Main Stats Block (Left) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Profile Card */}
              <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-emerald-400 font-bold tracking-widest block uppercase">
                    ● LINE PROVISIONED ACTIVE
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Matty Hagen
                  </h3>
                  <p className="font-mono text-xs text-brand-gray-400">
                    +1 (555) 019-4820 — PacMac Pro Ultra eSIM
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleTriggerReset}
                    className="py-2.5 px-4 border border-white/10 hover:border-white/20 rounded-xl font-mono text-[10px] text-white hover:bg-white/[0.02] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Network Line
                  </button>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="py-2.5 px-4 border border-white/10 hover:border-white/20 rounded-xl font-mono text-[10px] text-brand-gray-400 hover:text-white cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Data usage bar */}
              <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-display text-base font-bold text-white">5G Data Allocation</h4>
                  <span className="font-mono text-xs text-brand-gray-300">8.4 GB used of 10.0 GB</span>
                </div>
                
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-white h-full transition-all duration-500" style={{ width: '84%' }} />
                </div>

                <div className="flex justify-between font-mono text-[10px] text-brand-gray-500 border-t border-white/5 pt-4">
                  <span>Cycle ends in 11 days</span>
                  <span className="text-emerald-400 font-semibold">Adaptive Pricing active (Est. Refund: $7.42)</span>
                </div>
              </div>

              {/* Live Intercept screen logs */}
              <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
                <div>
                  <h4 className="font-display text-base font-bold text-white">PackieAI Spam Intercept logs</h4>
                  <p className="text-xs text-brand-gray-400 font-light mt-0.5">Real-time spam screening logs operating directly on your line.</p>
                </div>

                <div className="space-y-3 font-mono text-[10px]">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 border border-white/5 bg-black/60 rounded-xl flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-red-400 font-semibold uppercase">{log.type}</span>
                        <p className="text-brand-gray-300 font-light leading-relaxed">{log.content}</p>
                      </div>
                      <span className="text-brand-gray-500 shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar billing highlights (Right) */}
            <div className="lg:col-span-4 border border-white/10 bg-white/[0.01] rounded-2xl p-6 text-left space-y-6 backdrop-blur-md">
              <div>
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase tracking-widest block">
                  BILLING SUMMARY
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  Active Invoice
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-white/5 bg-black/60 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono text-brand-gray-500 uppercase">Estimated Due</span>
                  <span className="text-2xl font-bold text-white tracking-tight block">$22.58</span>
                  <span className="text-[9px] font-mono text-emerald-400">Autopay Scheduled Jun 01</span>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-brand-gray-450">Active Tier:</span>
                    <span className="text-white">10GB Adaptive Plan</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-brand-gray-450">Add-ons:</span>
                    <span className="text-white">PackieAI Screen ($5.00)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTriggerReset()}
                className="w-full py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Top-up Extra Data
                <Zap className="w-3.5 h-3.5 fill-black" />
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}

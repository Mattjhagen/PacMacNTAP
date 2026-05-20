import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Shield, ShieldCheck, RefreshCw, CheckCircle2, Zap, BarChart3, Clock, AlertCircle, PhoneOff, Eye } from 'lucide-react';

export default function CustomerDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('555-019-4820');
  const [passcode, setPasscode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'wrapped' | 'spam'>('overview');

  const [logs, setLogs] = useState([
    { id: 1, type: 'Intercepted', caller: '+1 (800) 412-9281', duration: '4.2m wasted', transcript: "PackieAI: 'Oh, you need my routing details? Sure, let me get my reading glasses. It starts with... wait, did you say routing or account?'", time: '10:14 AM' },
    { id: 2, type: 'Blocked SMS', caller: 'IRS Spoofing', duration: 'Blocked', transcript: "Attempted phishing URL detected: 'irs-tax-refund-gov-verify.com'. Quarantined automatically.", time: '9:30 AM' },
    { id: 3, type: 'Intercepted', caller: 'Vehicle Warranty Service', duration: '6.8m wasted', transcript: "PackieAI: 'Yes, I actually drive a 1928 steam tractor. Does the warranty cover boiler leaks?'", time: 'Yesterday' }
  ]);

  // Weekly data consumption (in GB)
  const weeklyConsumption = [
    { week: 'W1', gb: 1.2, label: 'Wi-Fi Heavy' },
    { week: 'W2', gb: 4.8, label: 'Office commute' },
    { week: 'W3', gb: 1.8, label: 'Vacation weekend' },
    { week: 'W4', gb: 0.6, label: 'Grass touched' }
  ];

  const totalUsed = weeklyConsumption.reduce((sum, item) => sum + item.gb, 0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
    }, 1000);
  };

  const handleTriggerReset = () => {
    alert("Simulated Tower Sync sequence initiated! Tower connection synchronized in 450ms.");
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
          <div className="w-full max-w-md border border-white/10 bg-white/[0.01] rounded-3xl p-6 md:p-8 backdrop-blur-md text-left space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                CARRIER PORTAL // ACCESS
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
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:border-white focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="font-mono text-[9px] text-brand-gray-550 uppercase block">Passcode</label>
                <input
                  type="password"
                  placeholder="••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white focus:border-white focus:outline-none transition-colors"
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
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
            
            {/* Left Main Column: Dashboard and Tabs */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Account Profile Block */}
              <div className="border border-white/10 bg-white/[0.01] rounded-3xl p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[9px] text-emerald-450 font-bold tracking-wider uppercase">
                      ACTIVE TOWER SYNCED
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Matty Hagen
                  </h3>
                  <p className="font-mono text-xs text-brand-gray-400">
                    +1 (555) 019-4820 — PacMac Pro eSIM
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleTriggerReset}
                    className="py-2.5 px-4 border border-white/10 hover:border-white/20 rounded-xl font-mono text-[10px] text-white hover:bg-white/[0.02] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync Tower Connection
                  </button>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="py-2.5 px-4 border border-white/10 hover:border-white/20 rounded-xl font-mono text-[10px] text-brand-gray-400 hover:text-white cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Console Tabs */}
              <div className="flex border-b border-white/10 gap-6">
                {(['overview', 'wrapped', 'spam'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 font-display text-sm font-semibold transition-all relative cursor-pointer ${
                      activeTab === tab ? 'text-white' : 'text-brand-gray-500 hover:text-brand-gray-300'
                    }`}
                  >
                    {tab.toUpperCase()}
                    {activeTab === tab && (
                      <motion.div layoutId="dashboardTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Outputs */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Interactive Consumption Graph */}
                      <div className="border border-white/10 bg-white/[0.01] rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-display text-base font-bold text-white">Consumption Telemetry</h4>
                            <p className="text-[10px] text-brand-gray-450 mt-1">Real-time breakdown of current billing cycle packets.</p>
                          </div>
                          <span className="font-mono text-xs text-brand-gray-300 bg-white/5 px-2.5 py-1 rounded-lg">
                            {totalUsed.toFixed(1)} GB Used
                          </span>
                        </div>

                        {/* Visual graph bars */}
                        <div className="grid grid-cols-4 gap-4 pt-4 items-end min-h-[140px]">
                          {weeklyConsumption.map((item, index) => (
                            <div key={index} className="flex flex-col items-center space-y-3">
                              <span className="text-[9px] font-mono text-brand-gray-400">{item.gb} GB</span>
                              <div className="w-full bg-white/5 rounded-t-lg h-24 relative overflow-hidden">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${(item.gb / 6) * 100}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.1 }}
                                  className="absolute bottom-0 left-0 right-0 bg-white"
                                />
                              </div>
                              <span className="text-[9px] font-mono text-brand-gray-500 uppercase">{item.week}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between text-left font-mono text-[9px] text-brand-gray-500 border-t border-white/5 pt-4 gap-2">
                          <span>Current billing cycle ends in 11 days</span>
                          <span className="text-emerald-400 font-semibold">Your bill was adjusted automatically to the $30 Standard Bracket</span>
                        </div>
                      </div>

                      {/* AI Summary Card */}
                      <div className="p-6 border border-white/10 bg-white/[0.02] rounded-3xl space-y-3 text-left">
                        <span className="font-mono text-[9px] text-brand-gray-500 uppercase block">AI ANALYSIS</span>
                        <p className="text-xs text-brand-gray-300 leading-relaxed font-sans font-light">
                          "You spent <span className="text-white font-medium">82% of your time on Wi-Fi</span> this cycle. Your bill noticed and automatically scaled back. Most active app was <span className="text-white font-medium">YouTube</span> during commute hours. Keep touching grass, it saves you money."
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'wrapped' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Badges and Highlights */}
                      <div className="p-6 border border-white/10 bg-white/[0.01] rounded-3xl space-y-6">
                        <div>
                          <span className="font-mono text-[8px] text-brand-gray-500 uppercase">MONTHLY WRAPPED</span>
                          <h4 className="font-display text-lg font-bold text-white mt-1">Your Device Personality</h4>
                        </div>
                        <div className="p-4 border border-white/10 bg-black/60 rounded-2xl text-center space-y-2">
                          <span className="text-[10px] font-mono text-brand-gray-400 uppercase">TIER IDENTIFIED</span>
                          <span className="font-display text-2xl font-bold text-white tracking-tight block">The Wi-Fi Commuter</span>
                          <span className="text-[9px] font-mono text-emerald-400 block">Saved $31.42 compared to average unlimited users</span>
                        </div>
                        <div className="space-y-2 font-mono text-[10px] text-brand-gray-400">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span>Top Peak Hours:</span>
                            <span className="text-white">8:00 AM - 9:30 AM</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span>Top Bandwidth App:</span>
                            <span className="text-white">YouTube (Obviously)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Tower Latency:</span>
                            <span className="text-white">22 ms (Excellent)</span>
                          </div>
                        </div>
                      </div>

                      {/* Screen / Protection stats */}
                      <div className="p-6 border border-white/10 bg-white/[0.01] rounded-3xl space-y-6">
                        <div>
                          <span className="font-mono text-[8px] text-brand-gray-550 uppercase">PACKIEAI TELEMETRY</span>
                          <h4 className="font-display text-lg font-bold text-white mt-1">Interception Stats</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border border-white/5 bg-black/60 rounded-xl text-center">
                            <span className="text-[28px] font-bold text-white">17</span>
                            <span className="text-[9px] font-mono text-brand-gray-500 block uppercase mt-1">Spam Blocked</span>
                          </div>
                          <div className="p-4 border border-white/5 bg-black/60 rounded-xl text-center">
                            <span className="text-[28px] font-bold text-white">48m</span>
                            <span className="text-[9px] font-mono text-brand-gray-500 block uppercase mt-1">Scammer Time Wasted</span>
                          </div>
                        </div>
                        <p className="text-[11px] font-light text-brand-gray-400 leading-relaxed">
                          "Honestly, your old carrier would've just let your phone ring 17 times. PackieAI spent 48 minutes talking to them so you could eat your lunch in peace."
                        </p>
                      </div>

                    </div>
                  )}

                  {activeTab === 'spam' && (
                    <div className="border border-white/10 bg-white/[0.01] rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
                      <div>
                        <h4 className="font-display text-base font-bold text-white">PackieAI Spam Intercept logs</h4>
                        <p className="text-xs text-brand-gray-400 font-light mt-0.5">Real-time spam screening logs operating directly on your line.</p>
                      </div>

                      <div className="space-y-4 font-mono text-[10px]">
                        {logs.map((log) => (
                          <div key={log.id} className="p-4 border border-white/5 bg-black/60 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-red-400 font-semibold uppercase">{log.type}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-brand-gray-400 font-medium">{log.duration}</span>
                                <span className="text-brand-gray-500">{log.time}</span>
                              </div>
                            </div>
                            <p className="text-brand-gray-300 font-light leading-relaxed border-t border-white/5 pt-2 italic">
                              {log.transcript}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

            </div>

            {/* Sidebar Invoice Details (Right) */}
            <div className="lg:col-span-4 border border-white/10 bg-white/[0.01] rounded-3xl p-6 text-left space-y-6 backdrop-blur-md">
              <div>
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase tracking-widest block">
                  CYCLE STATEMENT
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  Active Invoice
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-white/5 bg-black/60 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono text-brand-gray-500 uppercase">Estimated Due</span>
                  <span className="text-3xl font-bold text-white tracking-tight block">$35.00</span>
                  <span className="text-[9px] font-mono text-emerald-400">Autopay Scheduled Jun 01</span>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-brand-gray-450">Current Tier:</span>
                    <span className="text-white">Standard (15GB Cap)</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-brand-gray-450">Interception Add-on:</span>
                    <span className="text-white">PackieAI Screen (Included)</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] border-t border-white/5 pt-2">
                    <span className="text-brand-gray-400 font-bold">Billing Bracket:</span>
                    <span className="text-emerald-400 font-bold">$30.00 / mo</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleTriggerReset}
                className="w-full py-3.5 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Request Temporary Buffer
                <Zap className="w-3.5 h-3.5 fill-black" />
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}

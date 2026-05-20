import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, CreditCard, ShieldCheck, Check, Smartphone, Lock, ArrowUpRight, BarChart3, Database } from 'lucide-react';

interface ProvisionLog {
  id: string;
  time: string;
  type: string;
  details: string;
  status: string;
}

export default function OperationsPortal() {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [logs, setLogs] = useState<ProvisionLog[]>([
    { id: '1', time: '12:04:12', type: 'eSIM Onboarding', details: 'PacMac Pro Ultra activated via QR code', status: 'Success' },
    { id: '2', time: '12:03:55', type: 'Payment Processing', details: 'Stripe: Order #9832 ($599.00 Apple Pay approved)', status: 'Approved' },
    { id: '3', time: '12:02:18', type: 'SIM Dispatch', details: 'Physical SIM order #9831 packaged for shipping', status: 'In Route' },
    { id: '4', time: '12:00:04', type: 'PackieAI Config', details: 'Database update: Blocked number database synced', status: 'Synced' },
  ]);

  const [activeImei, setActiveImei] = useState<string>('990000862471903');
  const [simCode, setSimCode] = useState<string>('eSIM-849-PAC');

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate incoming orders & activations
      const types = ['eSIM Onboarding', 'Payment Processing', 'SIM Dispatch', 'PackieAI Config', 'Fraud Check'];
      const details = [
        'eSIM provisioned for brand new BYOP device',
        'Stripe: Subscription renewal approved ($24.00)',
        'Physical SIM order dispatch processed',
        'PackieAI: Spam activity blocked from MNO relay',
        'Fraud Shield: IMEI matching check successful (Risk score: 1.2%)'
      ];
      const statuses = ['Success', 'Approved', 'Shipped', 'Blocked', 'Cleared'];
      
      const newLog: ProvisionLog = {
        id: Math.random().toString(),
        time: new Date().toTimeString().split(' ')[0],
        type: types[Math.floor(Math.random() * types.length)],
        details: details[Math.floor(Math.random() * details.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
      
      setLogs((prev) => [newLog, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="portal" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Background visual glows */}
      <div className="absolute right-1/4 top-1/4 w-[500px] h-[500px] bg-white/[0.008] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
              08 // ECOMMERCE OPERATIONS CONSOLE
            </span>
            <div className="h-[1px] w-12 bg-brand-gray-800" />
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
            Designed for operations. <br />Future-ready architecture.
          </h2>
          
          <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed max-w-lg mx-auto">
            Switch between the Customer Dashboard view and the Admin Operations view to see how we track billing, inventory, provisioning, and MNO data routing.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="border border-white/10 rounded-2xl bg-white/[0.005] overflow-hidden backdrop-blur-md shadow-2xl flex flex-col items-stretch text-left">
          
          {/* Dashboard Nav Tabs */}
          <div className="border-b border-white/10 bg-white/[0.02] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <div className="flex bg-black/60 border border-white/5 rounded-xl p-1 font-mono text-[10px]">
              <button
                onClick={() => setActiveTab('customer')}
                className={`py-1.5 px-4 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'customer'
                    ? 'bg-white text-black font-semibold'
                    : 'text-brand-gray-300 hover:text-white bg-transparent'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Customer Account View
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-1.5 px-4 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-black font-semibold'
                    : 'text-brand-gray-300 hover:text-white bg-transparent'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Admin Operations Console
              </button>
            </div>

            {/* Console metadata */}
            <div className="flex items-center gap-4 text-[9px] font-mono text-brand-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Stripe Connected
              </span>
              <span className="hidden sm:inline">|</span>
              <span>eSIM Provisioner: ONLINE</span>
            </div>
          </div>

          {/* Dashboard Body Grid */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'customer' ? (
                /* CUSTOMER ACCOUNT TAB PANEL */
                <motion.div
                  key="customer-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Left Column: Plan & eSIM details */}
                  <div className="space-y-6">
                    <div className="border border-white/10 bg-black/60 rounded-xl p-5 space-y-4">
                      <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                        Active Connection
                      </span>
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-lg font-bold text-white">Adaptive Unlimited</h4>
                        <span className="px-2 py-0.5 border border-green-500/30 bg-green-500/5 text-[9px] text-green-400 font-mono rounded">
                          ACTIVE eSIM
                        </span>
                      </div>
                      <div className="font-mono text-xs text-brand-gray-400 space-y-1">
                        <div>ICCID: 890490320000049210</div>
                        <div>IMEI: {activeImei}</div>
                        <div>Provision: {simCode}</div>
                      </div>
                      <button className="w-full mt-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-lg font-mono text-[10px] uppercase transition-all flex items-center justify-center gap-1">
                        View eSIM QR Setup
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="border border-white/10 bg-black/60 rounded-xl p-5 space-y-4">
                      <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                        PackieAI Integration
                      </span>
                      <div className="flex items-center justify-between text-xs font-mono text-white">
                        <span>Call Screener status:</span>
                        <span className="text-green-400">ACTIVE</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 font-mono text-[10px] text-brand-gray-400 leading-relaxed">
                        <span className="text-white block font-semibold mb-1">Last Screen Log:</span>
                        "Scammer time wasted: 4.8 min. Caller recognized as: Solar Energy Sales."
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: AI billing details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="border border-white/10 bg-black/60 rounded-xl p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                            Billing Statement Summary
                          </span>
                          <h4 className="font-display text-xl font-bold text-white mt-1">Adaptive AI Invoice</h4>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-[10px] text-brand-gray-400 block">Autopay Approved</span>
                          <span className="text-lg font-semibold text-white">$24.00</span>
                        </div>
                      </div>

                      {/* AI bill explanation message */}
                      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 text-xs leading-relaxed space-y-3 font-mono">
                        <div className="flex items-center gap-2 text-white">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span className="font-bold">AI Billing Summary Breakdown:</span>
                        </div>
                        <p className="text-brand-gray-300 font-light">
                          "Hello. Your billing engine analyzed last month’s usage. We noticed your 18-hour tethering spike on public networks. Instead of charging you overage fees, we retroactively applied the 'Coffee Shop Hotspot Pass' ($8 savings). Data usage remained normal otherwise. Zero hidden fees applied."
                        </p>
                        <div className="text-[9px] text-brand-gray-500 uppercase flex items-center gap-1">
                          <span>Designed to save. Not to surprise.</span>
                        </div>
                      </div>

                      {/* Simple visual data bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-mono text-[10px] text-brand-gray-400">
                          <span>Data Usage: 14.8 GB / Dynamic Allotment</span>
                          <span>Bill Optimizing AutoPilot is ON</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
                          <div className="h-full bg-white rounded-full w-[45%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ADMIN OPERATIONS TAB PANEL */
                <motion.div
                  key="admin-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Left Column: Inventory Tracker & Network stats */}
                  <div className="space-y-6">
                    <div className="border border-white/10 bg-black/60 rounded-xl p-5 space-y-4">
                      <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                        Device Inventory Tracker
                      </span>
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between text-brand-gray-300">
                          <span>PacMac Pro Ultra:</span>
                          <span className="text-white font-semibold">124 units left</span>
                        </div>
                        <div className="flex items-center justify-between text-brand-gray-300">
                          <span>PacMac Light:</span>
                          <span className="text-white font-semibold">43 units left</span>
                        </div>
                        <div className="flex items-center justify-between text-brand-gray-300">
                          <span>PacMac Zero:</span>
                          <span className="text-yellow-400 font-semibold animate-pulse">8 units left</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-white/10 bg-black/60 rounded-xl p-5 space-y-4">
                      <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                        Payment Providers
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-brand-gray-300">
                        <div className="border border-white/5 bg-white/[0.01] p-2.5 rounded-lg flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-white/50" />
                          Stripe JS
                        </div>
                        <div className="border border-white/5 bg-white/[0.01] p-2.5 rounded-lg flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-white/50" />
                          Apple Pay
                        </div>
                        <div className="border border-white/5 bg-white/[0.01] p-2.5 rounded-lg flex items-center justify-center gap-1.5 col-span-2">
                          <Check className="w-3.5 h-3.5 text-white/50" />
                          Google Pay & ACH Secure
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Provisioning stream ticker */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="border border-white/10 bg-black/60 rounded-xl p-6 space-y-6 flex flex-col justify-between h-full min-h-[300px]">
                      <div>
                        <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                          Real-time Activation & Provisioning Log
                        </span>
                        <h4 className="font-display text-xl font-bold text-white mt-1">Carrier Network Ticker</h4>
                      </div>

                      {/* Stream Ticker list */}
                      <div className="space-y-2.5 flex-1 pt-4">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="border border-white/5 bg-white/[0.005] rounded-xl p-3 flex items-center justify-between text-[11px] font-mono hover:bg-white/[0.01] transition-colors"
                          >
                            <div className="space-y-0.5 text-left">
                              <span className="text-brand-gray-500 mr-2">[{log.time}]</span>
                              <span className="text-white font-bold">{log.type}</span>
                              <p className="text-brand-gray-400 font-light text-[10px] mt-0.5">{log.details}</p>
                            </div>
                            <span className="px-2 py-0.5 border border-white/20 bg-white/5 text-[9px] text-white rounded font-mono">
                              {log.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}

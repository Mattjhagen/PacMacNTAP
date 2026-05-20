import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Receipt, Sparkles, TrendingDown, ArrowRight, ShieldAlert, Cpu, Check } from 'lucide-react';

export default function AIBillingView() {
  const [optimizerActive, setOptimizerActive] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('Standard Adaptive');

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Light gradient glow */}
      <div className="absolute left-1/4 top-1/4 w-[450px] h-[350px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-left space-y-4 mb-16 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
              FINANCIAL TELEMETRY // AI BILLING
            </span>
            <div className="h-[1px] w-12 bg-brand-gray-800" />
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight">
            Your phone bill. <br />Adapting to you.
          </h1>
          <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed">
            We analyze your streaming, hotspot, and data peaks to dynamically optimize allocations. You only pay for what you actually use.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Bill breakdown mock card (Left) */}
          <div className="lg:col-span-8 border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md text-left space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase">ACTIVE ACCOUNT BLOCK</span>
                <h3 className="font-display text-lg font-bold text-white">Invoice #PAC-BILL-9402</h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase block">BILLING PERIOD</span>
                <span className="text-xs font-mono text-white block mt-0.5">MAY 01 - MAY 31, 2026</span>
              </div>
            </div>

            {/* Current statement details */}
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-brand-gray-400">Core 5G Network Bandwidth Allocation</span>
                <span className="text-white">$25.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-brand-gray-400">PackieAI Spam Call Screening sync</span>
                <span className="text-white">$5.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-brand-gray-400">Hotspot Sharing (Overages: None)</span>
                <span className="text-white">$0.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5 text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Adaptive Usage Refund (Unused Data Credits)
                </span>
                <span>-$7.42</span>
              </div>
              
              <div className="flex justify-between py-4 text-base border-t border-white/10 font-bold pt-6">
                <span className="text-white">Adjusted Total Due:</span>
                <span className="text-white">$22.58</span>
              </div>
            </div>

            {/* AI Explanation block */}
            <div className="p-4 border border-white/10 bg-white/[0.01] rounded-xl flex gap-3.5 items-start">
              <Cpu className="w-6 h-6 text-white shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-display text-xs font-semibold text-white">AI Billing Insights</h4>
                <p className="text-[11px] text-brand-gray-400 font-light leading-relaxed">
                  "You saved $7.42 this month because your streaming activity peaked only during weekend home-Wi-Fi slots. Our system automatically adjusted your cellular profile to prevent over-allocation. Your data threshold recommendation remains locked on the 10GB scale."
                </p>
              </div>
            </div>
          </div>

          {/* Optimizer controls (Right) */}
          <div className="lg:col-span-4 border border-white/10 bg-white/[0.01] rounded-2xl p-6 text-left space-y-6 backdrop-blur-md">
            <div>
              <span className="font-mono text-[9px] text-brand-gray-500 uppercase tracking-widest block">
                BILLING CO-PILOT
              </span>
              <h3 className="font-display text-xl font-bold text-white mt-1">
                Plan Tuning
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-white/5 bg-black/60 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-white block">Auto-Adaptive Adjustments</span>
                  <span className="text-[10px] text-brand-gray-450 font-light block">Let AI adjust billing brackets</span>
                </div>
                <button
                  onClick={() => setOptimizerActive(prev => !prev)}
                  className={`w-10 h-6 rounded-full transition-all relative cursor-pointer border ${
                    optimizerActive 
                      ? 'bg-white border-white' 
                      : 'bg-black border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-all ${
                    optimizerActive 
                      ? 'left-[21px] bg-black' 
                      : 'left-[3px] bg-white'
                  }`} />
                </button>
              </div>

              {/* Recommended profiles */}
              <div className="space-y-2.5">
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase block tracking-wider">
                  Select Billing Profile
                </span>
                
                {['Lite (5GB focus)', 'Standard Adaptive', 'Max Performance (Hotspot priority)'].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 rounded-xl border text-left font-mono text-[11px] transition-all cursor-pointer flex justify-between items-center ${
                      selectedPlan === plan
                        ? 'border-white bg-white/[0.02] text-white'
                        : 'border-white/10 text-brand-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{plan}</span>
                    {selectedPlan === plan && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border border-emerald-500/10 bg-emerald-500/[0.01] rounded-xl flex gap-3 text-xs font-mono text-emerald-300">
              <TrendingDown className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span>Adaptive billing saves users an average of 19% versus fixed legacy contracts.</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

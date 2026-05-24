import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Radio, ArrowRight, ShieldCheck, DollarSign, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../utils/storage';
import { billingService } from '../services/billingService';

export default function Plans() {
  const [dataUsage, setDataUsage] = useState(14);
  const navigate = useNavigate();

  // Selected rigid carrier comparison plan tier
  const carrierPlanTier = 80;
  const carrierPrice = 75; // Standard flat price for an 80GB/Unlimited plan

  // Dynamic calculations via billingService
  const pacMacPrice = billingService.calculateAdaptiveRate(dataUsage);
  const savings = Math.max(0, carrierPrice - pacMacPrice);

  const handleSelectPlan = () => {
    addToCart({
      type: 'plan',
      name: 'Adaptive Wireless Line',
      price: pacMacPrice
    });
    navigate('/byop');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24 font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[85vw] h-[45vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24">
        
        {/* Emotional Header - Leading with the core billing issue first */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16 space-y-4 sm:space-y-6">
          <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-brand-gray-500 block">
            The Telecom Guessing Game is Over
          </span>
          
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.15] text-white">
            You paid for <span className="underline decoration-white/20 text-neutral-400">80 GB</span>. <br />
            You used <span className="font-mono text-white glow-sm">14 GB</span>. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-brand-gray-400 text-glow-sm">
              Your carrier kept the difference.
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-xs sm:text-sm md:text-base text-brand-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Traditional carriers profit when you overestimate your plan. They lock you into static tiers, charging you upfront for data you never touch. We think that's wrong. PacMac adjusts dynamically: we count your gigabytes, billing you only for what you consume, up to a maximum safety cap of $30.
          </p>
        </div>

        {/* Dynamic Interactive Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10 sm:mb-16">
          
          {/* Slider Controls (Left 7 cols) */}
          <div className="lg:col-span-7 border border-white/5 bg-neutral-950/40 backdrop-blur-md rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-mono text-[9px] sm:text-[10px] text-brand-gray-500 uppercase tracking-widest">
                    Simulate Your Monthly Data
                  </h3>
                  <p className="text-[9px] text-brand-gray-400 font-mono mt-0.5 animate-pulse">Drag to compare rate scales</p>
                </div>
                <span className="font-display text-xl sm:text-2xl font-semibold text-white">
                  {dataUsage === 50 ? "50+ GB" : `${dataUsage} GB`}
                </span>
              </div>

              {/* Slider with improved touch target heights */}
              <div className="relative py-4 mb-6 sm:mb-10">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={dataUsage}
                  onChange={(e) => setDataUsage(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
                  aria-label="Simulated Monthly Data Usage"
                />
                <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-brand-gray-600 mt-2 select-none">
                  <span>0 GB</span>
                  <span>10 GB</span>
                  <span>20 GB</span>
                  <span>30 GB (Safety Cap)</span>
                  <span>50 GB</span>
                </div>
              </div>
            </div>

            {/* Waste analysis telemetry block */}
            <div className="bg-white/[0.01] border border-white/5 rounded-lg p-4 font-mono text-[11px] sm:text-xs text-brand-gray-400 space-y-2">
              <p className="text-[9px] sm:text-[10px] text-brand-gray-500 uppercase tracking-wider">
                Telemetry Breakdown
              </p>
              {dataUsage < 30 ? (
                <p className="leading-relaxed">
                  🔋 You used <strong className="text-white font-normal">{dataUsage} GB</strong>. Traditional plan margin: <strong className="text-white font-normal">${(carrierPrice - pacMacPrice).toFixed(2)}</strong> paid for unused data. PacMac billed rate scales down automatically.
                </p>
              ) : (
                <p className="leading-relaxed">
                  ⚡ Heavy usage. Your PacMac rate has hit the <strong className="text-white font-normal">$30 Safety Cap</strong>. Unthrottled 5G speed continues, but additional charges stop.
                </p>
              )}
            </div>
          </div>

          {/* Pricing Ledger Comparison (Right 5 cols) */}
          <div className="lg:col-span-5 border border-white/10 bg-neutral-950/80 rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <div className="space-y-6">
              <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">
                Adaptive Ledger
              </h3>

              {/* PacMac */}
              <div>
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-wider block">
                  PacMac Bill
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-display font-semibold text-white">
                    ${pacMacPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-brand-gray-500 font-mono">/mo</span>
                </div>
              </div>

              {/* Carrier */}
              <div className="flex justify-between items-center text-xs border-t border-b border-white/5 py-4">
                <div>
                  <span className="text-brand-gray-400 font-mono">Legacy Carrier Tier</span>
                  <span className="block text-[9px] font-mono text-brand-gray-500 mt-0.5">80GB Flat Rate</span>
                </div>
                <span className="font-mono text-brand-gray-300 font-medium">${carrierPrice.toFixed(2)}</span>
              </div>

              {/* Savings */}
              <div className="rounded-lg bg-white/5 border border-white/10 p-3.5 flex items-center justify-between">
                <span className="text-xs font-medium text-brand-gray-300">Monthly Savings</span>
                <span className="text-xs font-mono font-bold text-white shadow-text-white bg-white/10 px-2 py-0.5 rounded">
                  +${savings.toFixed(2)}/mo
                </span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleSelectPlan}
                className="w-full py-3.5 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Select Adaptive Line
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="block text-[9px] font-mono text-center text-brand-gray-500 mt-2">
                No contracts. eSIM configuration ready.
              </span>
            </div>
          </div>
        </div>

        {/* Detailed comparisons */}
        <div className="border-t border-white/5 pt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto font-sans">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Rigid Competitor Tiers</h4>
            <p className="text-xs sm:text-sm text-brand-gray-400 leading-relaxed font-light">
              You choose between locked 10GB, 30GB, or "Unlimited" levels. If you go under, you waste money. If you go over, they apply overage charges or throttle your speed to 128kbps, forcing you to pay for "extra data passes".
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">PacMac Usage Curve</h4>
            <p className="text-xs sm:text-sm text-brand-gray-400 leading-relaxed font-light">
              We charge a base of $12/mo (includes 2GB). From there, data scales up at $0.64 per gigabyte. If you stream high-def files and cross 30GB, billing halts at the $30 safety cap. Unlimited, unthrottled 5G coverage, with zero guess work.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

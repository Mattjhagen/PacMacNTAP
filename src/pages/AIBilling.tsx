import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ArrowRight, ShieldCheck, DollarSign, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIBilling() {
  const [gbUsed, setGbUsed] = useState(6);
  const [carrierPlanTier, setCarrierPlanTier] = useState(20); // They bought a 20GB tier for $65/mo

  const calculateCarrierBill = (gb: number, tier: number) => {
    const basePrice = tier === 10 ? 45 : tier === 20 ? 60 : 75; // Rigid plan rates
    if (gb <= tier) return basePrice;
    
    // Overage charges ($15/GB)
    const overage = Math.ceil(gb - tier) * 15;
    return basePrice + overage;
  };

  const calculatePacMacBill = (gb: number) => {
    if (gb <= 2) return 12;
    if (gb >= 30) return 30;
    const fraction = (gb - 2) / 28;
    return Math.round((12 + fraction * 18) * 100) / 100;
  };

  const carrierBill = calculateCarrierBill(gbUsed, carrierPlanTier);
  const pacMacBill = calculatePacMacBill(gbUsed);
  const savings = Math.max(0, carrierBill - pacMacBill);

  const getCarrierExplanation = (gb: number, tier: number) => {
    if (gb < tier) {
      const unused = tier - gb;
      return `⚠️ You used ${gb}GB of your ${tier}GB plan. You paid for ${unused.toFixed(0)}GB that went completely unused, which your carrier pocketed as pure margin.`;
    } else if (gb > tier) {
      const overGb = (gb - tier).toFixed(0);
      return `🚨 You exceeded your ${tier}GB allocation by ${overGb}GB. Overage penalties are applied at $15/GB. Your bill surged.`;
    }
    return `🎯 You used exactly what you bought. (Statistically this happens to less than 2% of cell subscribers each month).`;
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24 font-sans">
      {/* Background radial glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[75vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 md:pt-40">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500">
            Billing Architecture Simulator
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-2">
            The math behind adaptive billing.
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-brand-gray-400 leading-relaxed font-light">
            We built a billing ledger that queries on-tower consumption metrics daily and recalculates your rate automatically. Let's look at the numbers.
          </p>
        </div>

        {/* Simulator Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* Settings Box (Left 6 cols) */}
          <div className="lg:col-span-6 border border-white/5 bg-neutral-950/40 rounded-xl p-8 space-y-6">
            <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">
              Configure Simulator Parameters
            </h3>

            {/* Slider: Gigs used */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-brand-gray-300">Simulated Monthly Data Used</span>
                <span className="font-mono font-bold text-white">{gbUsed} GB</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={gbUsed}
                onChange={(e) => setGbUsed(Number(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Selector: Legacy carrier plan bought */}
            <div className="space-y-3">
              <label className="block text-[9px] font-mono text-brand-gray-500 uppercase tracking-wider">
                Compare Against Rigid Carrier Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 10, label: "10GB plan ($45)" },
                  { value: 20, label: "20GB plan ($60)" },
                  { value: 30, label: "30GB plan ($75)" }
                ].map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() => setCarrierPlanTier(tier.value)}
                    className={`py-2 rounded border text-[10px] font-mono transition-all ${
                      carrierPlanTier === tier.value
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-950 border-white/10 text-brand-gray-400 hover:text-white'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis text */}
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 font-mono text-[11px] text-brand-gray-400 leading-relaxed">
              {getCarrierExplanation(gbUsed, carrierPlanTier)}
            </div>
          </div>

          {/* Results Box (Right 6 cols) */}
          <div className="lg:col-span-6 border border-white/10 bg-neutral-950/80 rounded-xl p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="space-y-6">
              <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">
                Monthly Bill Comparison
              </h3>

              {/* PacMac Bill */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="text-xs font-semibold text-white block">PacMac Adaptive Bill</span>
                  <span className="text-[10px] text-brand-gray-500 font-mono">Scales to exact usage</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-white font-mono">${pacMacBill.toFixed(2)}</span>
                  <span className="text-[9px] text-brand-gray-500 font-mono block">No overages</span>
                </div>
              </div>

              {/* Carrier Bill */}
              <div className="flex justify-between items-center py-2 border-t border-b border-white/5">
                <div>
                  <span className="text-xs text-brand-gray-400 block">Rigid Legacy Carrier Bill</span>
                  <span className="text-[10px] text-brand-gray-500 font-mono">Bucket plan + overages</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-medium text-brand-gray-400 font-mono">${carrierBill.toFixed(2)}</span>
                  <span className="text-[9px] text-red-400 font-mono block">
                    {gbUsed > carrierPlanTier ? `+$${(gbUsed - carrierPlanTier) * 15} overage` : 'Unused data lost'}
                  </span>
                </div>
              </div>

              {/* Savings callout */}
              <div className="rounded-xl bg-white/5 border border-white/15 p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-brand-gray-400 uppercase tracking-wider block">
                    Monthly Savings
                  </span>
                  <span className="text-xs text-brand-gray-500 font-mono mt-0.5 block">Keeping your funds in check</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span className="font-mono text-base font-bold text-white shadow-text-white">
                    +${savings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/plans"
                className="w-full py-3.5 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Choose Adaptive Line
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

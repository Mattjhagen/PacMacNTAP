import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, HelpCircle, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface CarrierConfig {
  name: string;
  price: number;
  planLimit: number;
  planName: string;
  fearFactor: string;
}

export default function AdaptivePlansSection() {
  const [selectedCarrierKey, setSelectedCarrierKey] = useState<string>('verizon');
  const [dataUsage, setDataUsage] = useState<number>(14);
  const [activeMonthTab, setActiveMonthTab] = useState<number>(1);

  const carriers: Record<string, CarrierConfig> = {
    verizon: {
      name: 'Verizon',
      planName: 'Unlimited Plus',
      price: 80,
      planLimit: 80,
      fearFactor: 'Overpaying for safety nets you never hit.'
    },
    att: {
      name: 'AT&T',
      planName: 'Premium PL',
      price: 85,
      planLimit: 100,
      fearFactor: 'Fear of overage fees locks you into the highest tier.'
    },
    tmobile: {
      name: 'T-Mobile',
      planName: 'Go5G Next',
      price: 95,
      planLimit: 120,
      fearFactor: 'Paying for extra entertainment bundles you rarely use.'
    },
    prepaid: {
      name: 'Legacy Prepaid',
      planName: 'Fixed Starter',
      price: 45,
      planLimit: 15,
      fearFactor: 'Throttled to unusable speeds if you go over by 1 MB.'
    }
  };

  const currentCarrier = carriers[selectedCarrierKey];

  // PacMac Billing Brackets:
  // - <= 5GB: $20 (Starter)
  // - <= 15GB: $30 (Standard)
  // - <= 30GB: $38 (Pro)
  // - > 30GB: $45 (Unlimited)
  const getPacMacTier = (gb: number) => {
    if (gb <= 5) return { name: 'Starter', price: 20, limit: 5 };
    if (gb <= 15) return { name: 'Standard', price: 30, limit: 15 };
    if (gb <= 30) return { name: 'Pro', price: 38, limit: 30 };
    return { name: 'Unlimited', price: 45, limit: 80 };
  };

  const pacMacTier = getPacMacTier(dataUsage);
  
  // Calculations
  const wastedData = Math.max(0, currentCarrier.planLimit - dataUsage);
  const monthlySavings = currentCarrier.price - pacMacTier.price;
  const annualSavings = monthlySavings * 12;

  // Monthly scenarios for the prediction modeler
  const scenarios = [
    {
      monthNum: 1,
      label: 'Month 1: Home Wi-Fi Heavy',
      usage: 4,
      context: 'You stayed on home Wi-Fi during vacation. PacMac billing dropped you to the $20 Starter Tier. Your legacy carrier charged you full price.'
    },
    {
      monthNum: 2,
      label: 'Month 2: Travel Season',
      usage: 32,
      context: 'You streamed videos on the highway. PacMac automatically scaled you to the $45 Unlimited Tier. No throttling or penalties.'
    },
    {
      monthNum: 3,
      label: 'Month 3: Standard Office Month',
      usage: 12,
      context: 'Typical work commute. PacMac placed you in the $30 Standard Tier. Your billing adapted automatically.'
    }
  ];

  const handleApplyScenario = (usage: number, monthNum: number) => {
    setDataUsage(usage);
    setActiveMonthTab(monthNum);
  };

  const handleScrollToWaitlist = () => {
    const element = document.querySelector('#waitlist');
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="adaptive-plans" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Subtle light glow */}
      <div className="absolute left-1/3 top-1/4 w-[600px] h-[600px] rounded-full bg-white/[0.006] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Header Block */}
        <div className="text-left space-y-4 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
              05 // ADAPTIVE WIRELESS
            </span>
            <div className="h-[1px] w-12 bg-brand-gray-800" />
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight">
            Your bill adjusts. <br />Not your lifestyle.
          </h1>

          <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed">
            Legacy carriers profit when you buy more than you need. PacMac uses localized system intelligence to adjust your billing bracket automatically based on what you actually consume.
          </p>
        </div>

        {/* Dynamic Simulator Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Simulator Controls & Calculations (Left) */}
          <div className="lg:col-span-7 border border-white/10 bg-white/[0.01] rounded-3xl p-6 md:p-8 backdrop-blur-md text-left flex flex-col justify-between space-y-8">
            
            {/* Step 1: Select Carrier */}
            <div className="space-y-4">
              <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-wider block">
                STEP 1: SELECT YOUR CURRENT CARRIER
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(carriers).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCarrierKey(key)}
                    className={`py-3 px-4 border rounded-xl font-display text-xs font-semibold text-center transition-all cursor-pointer ${
                      selectedCarrierKey === key
                        ? 'border-white bg-white text-black'
                        : 'border-white/15 bg-transparent text-brand-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {config.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-wider">
                  STEP 2: MODEL YOUR AVERAGE MONTHLY DATA USAGE
                </span>
                <span className="text-white font-mono text-sm font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  {dataUsage} GB
                </span>
              </div>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={dataUsage}
                  onChange={(e) => setDataUsage(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between font-mono text-[8px] text-brand-gray-500">
                  <span>1 GB</span>
                  <span>15 GB (Prepaid Limit)</span>
                  <span>30 GB</span>
                  <span>60 GB</span>
                </div>
              </div>
            </div>

            {/* Step 3: Emotional Realization Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
              <div className="p-4 border border-white/10 bg-black/60 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[8px] text-brand-gray-550 uppercase block">LEGACY CARRIER</span>
                  <span className="font-display text-xl font-bold text-white mt-1 block">
                    {currentCarrier.name} {currentCarrier.planName}
                  </span>
                  <p className="text-[10px] text-brand-gray-400 mt-2 font-light leading-relaxed">
                    You pay a fixed <span className="text-white font-medium">${currentCarrier.price}</span> to get {currentCarrier.planLimit}GB. {currentCarrier.fearFactor}
                  </p>
                </div>
                <div className="mt-4 border-t border-white/5 pt-3 flex justify-between font-mono text-[9px]">
                  <span className="text-brand-gray-500">Unused Capacity:</span>
                  <span className="text-red-400 font-bold">{wastedData} GB wasted</span>
                </div>
              </div>

              <div className="p-4 border border-white/15 bg-white/[0.02] rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-emerald-400/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <span className="font-mono text-[8px] text-emerald-400 uppercase block">PACMAC ADAPTIVE BILLING</span>
                  <span className="font-display text-xl font-bold text-white mt-1 block">
                    {pacMacTier.name} Tier
                  </span>
                  <p className="text-[10px] text-brand-gray-300 mt-2 font-light leading-relaxed">
                    PacMac automatically matched you to our <span className="text-white font-medium">${pacMacTier.price}</span> bracket because you used {dataUsage}GB. No wasted spend.
                  </p>
                </div>
                <div className="mt-4 border-t border-white/5 pt-3 flex justify-between font-mono text-[9px]">
                  <span className="text-brand-gray-400">Monthly Savings:</span>
                  <span className="text-emerald-400 font-bold">${monthlySavings} saved</span>
                </div>
              </div>
            </div>

            {/* Savings Counter */}
            <div className="p-5 border border-white/15 bg-white/[0.01] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase block">ESTIMATED ANNUAL MEMBERSHIP REBATE</span>
                <span className="font-display text-3xl font-bold text-white mt-1 block">
                  ${annualSavings} / year back in your pocket
                </span>
              </div>
              <button
                onClick={handleScrollToWaitlist}
                className="py-3 px-6 text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all cursor-pointer shrink-0"
              >
                Get Early Invitation
              </button>
            </div>

          </div>

          {/* Monthly Behavior Modeler Sequence (Right) */}
          <div className="lg:col-span-5 border border-white/10 bg-black/80 rounded-3xl p-6 md:p-8 text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">ADAPTIVE FORECASTING</span>
                <h3 className="font-display text-lg font-bold text-white mt-1">Month-to-Month Behavior</h3>
              </div>
              <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                Click any of the scenarios below to model how PacMac automatically handles fluctuations in your digital behavior cycle.
              </p>
            </div>

            {/* Month Scenarios Tabs */}
            <div className="space-y-3">
              {scenarios.map((sc) => (
                <button
                  key={sc.monthNum}
                  onClick={() => handleApplyScenario(sc.usage, sc.monthNum)}
                  className={`w-full p-4 border rounded-2xl transition-all text-left block cursor-pointer ${
                    activeMonthTab === sc.monthNum
                      ? 'border-white bg-white/[0.03]'
                      : 'border-white/5 bg-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-display text-xs font-semibold text-white">{sc.label}</span>
                    <span className="font-mono text-[10px] text-brand-gray-400">{sc.usage} GB used</span>
                  </div>
                  {activeMonthTab === sc.monthNum && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[10px] text-brand-gray-400 mt-2 font-sans font-light leading-relaxed border-t border-white/5 pt-2"
                    >
                      {sc.context}
                    </motion.p>
                  )}
                </button>
              ))}
            </div>

            {/* Behind the Curtain: How pricing works */}
            <div className="p-4 border border-white/5 bg-white/[0.01] rounded-2xl space-y-2">
              <span className="font-mono text-[9px] text-brand-gray-500 uppercase block">HOW PACMAC BRACKETS OPERATE</span>
              <p className="text-[10px] text-brand-gray-400 leading-relaxed font-sans font-light">
                We place you into brackets retrospectively at the end of each billing cycle: $20 (5GB), $30 (15GB), $38 (30GB), or $45 (Unlimited). No complex formulas. Just predictable logic that has your back.
              </p>
            </div>

          </div>

        </div>

        {/* Legacy vs. PacMac Contrast Matrix */}
        <div className="space-y-6 pt-12 border-t border-white/5">
          <div className="text-left">
            <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">COMPARISON MATRIX</span>
            <h2 className="font-display text-2xl font-bold text-white mt-1">
              Structural differences.
            </h2>
          </div>

          <div className="border border-white/10 bg-white/[0.01] rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.02] p-4 text-[10px] font-mono text-brand-gray-500 tracking-wider text-left">
              <span>CRITERIA</span>
              <span>LEGACY CARRIERS</span>
              <span>PACMAC MOBILE</span>
            </div>

            <div className="divide-y divide-white/5 text-left text-xs font-sans">
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-white font-medium">Unused Data</span>
                <span className="text-brand-gray-400 font-light">Kept as pure profit by carrier</span>
                <span className="text-emerald-400 font-medium">Automatically drops your bill</span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-white font-medium">Plan Commitments</span>
                <span className="text-brand-gray-400 font-light">36-month contracts / installment locks</span>
                <span className="text-white font-light">Cancel or switch in two clicks</span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-white font-medium">Pricing Predictability</span>
                <span className="text-brand-gray-400 font-light">Unannounced mid-year rate hikes</span>
                <span className="text-white font-light">Flat bracket pricing, forever locked</span>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="text-white font-medium">Support Resolution</span>
                <span className="text-brand-gray-400 font-light">Flowcharts and call centers</span>
                <span className="text-white font-light">Competent systems-access AI co-pilots</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Invitation Disclaimers */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8 text-[10px] font-mono text-brand-gray-550">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-gray-500" />
            <span>Still rolling out quietly. Early access remains limited.</span>
          </div>
          <span>Some people already switched. They’ve been weirdly smug about it.</span>
        </div>

      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, TrendingUp, Sparkles, Receipt, EyeOff, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

interface CardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
}

export default function AdaptivePlansSection() {
  const [activeHeadlineIdx, setActiveHeadlineIdx] = useState(0);
  const [chaosSelection, setChaosSelection] = useState<string>('tiktok');
  
  const rotatingHeadlines = [
    "Like Progressive Snapshot, but for your phone bill.",
    "AI-powered mobile plans that adapt to your actual habits.",
    "Your current carrier sees usage. Ours tries to help.",
    "Finally, a phone bill with situational awareness."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeadlineIdx((prev) => (prev + 1) % rotatingHeadlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const cards: CardItem[] = [
    {
      id: 'learning',
      title: 'Usage Learning',
      description: 'Learns which apps and services you actually use most.',
      icon: <Activity className="w-5 h-5 text-white" />,
      examples: [
        "Yes, the AI noticed your 11-hour TikTok session.",
        "Streaming usage detected. Again.",
        "Probably too much YouTube."
      ]
    },
    {
      id: 'predictions',
      title: 'Smart Predictions',
      description: 'Estimates next month’s usage before your bill becomes emotionally upsetting.',
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      examples: [
        "AI predicts you’ll continue watching conspiracy documentaries at dangerous levels.",
        "Your current carrier would have charged you first and explained later."
      ]
    },
    {
      id: 'optimization',
      title: 'Adaptive Optimization',
      description: 'Suggests smarter data configurations automatically.',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      examples: [
        "Your hotspot usage suggests you don’t trust public Wi-Fi. Fair.",
        "Usage spike detected after midnight. We’re not asking questions."
      ]
    },
    {
      id: 'billing',
      title: 'AI Billing',
      description: 'Explains your charges like a normal human instead of an ancient telecom wizard.',
      icon: <Receipt className="w-5 h-5 text-white" />,
      examples: [
        "0.00kb data padding fees. Because we don't cheat.",
        "Transparent breakdowns. Zero corporate marketing filler."
      ]
    }
  ];

  const reassuringMessages = [
    "Optional. Transparent. Not weird.",
    "You control what gets analyzed.",
    "Designed to optimize plans, not sell your life story.",
    "Less surveillance capitalism. More useful math.",
    "The goal is fewer surprises, not more ads."
  ];

  const chaosResponses: Record<string, { title: string; analysis: string; optimization: string }> = {
    tiktok: {
      title: "Vertical Video Vortex",
      analysis: "We detected continuous high-bandwidth video packets looping from vertical social media channels for 9 hours straight.",
      optimization: "Recommendation: Activate 'Social Autopilot'. We'll adjust your data cap dynamically and queue low-priority data. Also: Stand up, stretch your neck, and look at a real tree."
    },
    conspiracy: {
      title: "Late-Night Rabbit Hole",
      analysis: "Significant data spike detected between 1:00 AM and 4:30 AM. Video streams loaded in high definition.",
      optimization: "Recommendation: Auto-enable 'Sleep Mode' buffering limit. Also: The moon landing was real, sleep cycles are important, put the phone down."
    },
    hotspot: {
      title: "Paranoid Tethering",
      analysis: "Frequent hotspot sessions initiated in various public coffee shops. Your laptop, tablet, and smart watch are tethered simultaneously.",
      optimization: "Recommendation: Transition to 'Secure Tether Pass'. Also: We know public Wi-Fi is scary, but you don't need to tether everything at once."
    },
    gaming: {
      title: "3 AM Ranked Lobby",
      analysis: "Low-bandwidth, high-frequency packets and ultra-low latency packets active until dawn.",
      optimization: "Recommendation: Prioritize low-latency game packets. Also: Drink a glass of water, your guild can survive without you for one night."
    }
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

      {/* Background visual indicators */}
      <div className="absolute left-1/4 top-1/3 w-[600px] h-[600px] rounded-full bg-white/[0.008] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
              05 // ADAPTIVE AI PLANS
            </span>
            <div className="h-[1px] w-12 bg-brand-gray-800" />
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
            Your phone plan should probably <br />
            know you stream too much.
          </h2>

          <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed max-w-2xl mx-auto">
            PacMac Adaptive AI Plans learn your usage patterns and help optimize your bill before your carrier would normally surprise you with it.
          </p>

          {/* Rotating subheadlines */}
          <div className="h-6 overflow-hidden flex items-center justify-center pt-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeHeadlineIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-xs text-brand-gray-450 tracking-wide"
              >
                “{rotatingHeadlines[activeHeadlineIdx]}”
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all duration-300 group"
            >
              <div className="space-y-6">
                <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white">
                  {card.icon}
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Cycling dynamic logs panel on hover/focus */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-left">
                <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                  Simulated Log Input:
                </span>
                <div className="bg-black/50 border border-white/5 rounded-lg p-2.5 font-mono text-[10px] text-brand-gray-300 min-h-[50px] flex items-center">
                  <span className="animate-pulse mr-1.5 text-white">•</span>
                  <span>{card.examples[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reassuring / Privacy Panel */}
        <div className="border border-white/5 bg-white/[0.005] rounded-2xl p-6 md:p-8 backdrop-blur-sm mb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-gray-300">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-white">Designed to optimize, not spy.</h4>
                <p className="text-xs text-brand-gray-400 font-light">We use localized math, not tracking databases.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
              {reassuringMessages.slice(0, 3).map((msg, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-brand-gray-400 border border-white/10 rounded-full px-3 py-1 bg-white/[0.01]">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Playful Interactive Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Simulator Selection (Left) */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 text-left space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-4 h-4 text-white animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-brand-gray-500">
                  Try it free for a month
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-white">
                Analyze My Chaos
              </h3>
              <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                Let the AI learn your usage habits before making recommendations. Worst case scenario: it discovers you spend too much time on YouTube.
              </p>
            </div>

            {/* Interactive selection buttons */}
            <div className="space-y-3">
              <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                Select your mobile vice:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setChaosSelection('tiktok')}
                  className={`py-2 px-3.5 rounded-xl border text-[11px] font-mono text-center transition-all cursor-pointer ${
                    chaosSelection === 'tiktok'
                      ? 'border-white text-black bg-white'
                      : 'border-white/10 text-brand-gray-300 hover:border-white/30 bg-transparent'
                  }`}
                >
                  Late-Night TikTok
                </button>
                <button
                  onClick={() => setChaosSelection('conspiracy')}
                  className={`py-2 px-3.5 rounded-xl border text-[11px] font-mono text-center transition-all cursor-pointer ${
                    chaosSelection === 'conspiracy'
                      ? 'border-white text-black bg-white'
                      : 'border-white/10 text-brand-gray-300 hover:border-white/30 bg-transparent'
                  }`}
                >
                  Conspiracy Vids
                </button>
                <button
                  onClick={() => setChaosSelection('hotspot')}
                  className={`py-2 px-3.5 rounded-xl border text-[11px] font-mono text-center transition-all cursor-pointer ${
                    chaosSelection === 'hotspot'
                      ? 'border-white text-black bg-white'
                      : 'border-white/10 text-brand-gray-300 hover:border-white/30 bg-transparent'
                  }`}
                >
                  Coffee Shop Tether
                </button>
                <button
                  onClick={() => setChaosSelection('gaming')}
                  className={`py-2 px-3.5 rounded-xl border text-[11px] font-mono text-center transition-all cursor-pointer ${
                    chaosSelection === 'gaming'
                      ? 'border-white text-black bg-white'
                      : 'border-white/10 text-brand-gray-300 hover:border-white/30 bg-transparent'
                  }`}
                >
                  3 AM Gaming
                </button>
              </div>
            </div>

            {/* Playful CTAs that scroll to Waitlist */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <button
                onClick={handleScrollToWaitlist}
                className="w-full py-3 text-center text-xs font-semibold text-black bg-white rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                Let The AI Judge Me
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex items-center justify-between text-[9px] font-mono text-brand-gray-500 px-1">
                <button onClick={handleScrollToWaitlist} className="hover:text-white cursor-pointer bg-transparent border-none">
                  [ Fine. Optimize Me. ]
                </button>
                <button onClick={handleScrollToWaitlist} className="hover:text-white cursor-pointer bg-transparent border-none">
                  [ Teach The Robot ]
                </button>
              </div>
            </div>
          </div>

          {/* Simulator Console Screen (Right) */}
          <div className="lg:col-span-7 flex flex-col justify-between border border-white/10 bg-black/80 rounded-2xl overflow-hidden font-mono text-xs relative select-none min-h-[300px]">
            {/* Console Header */}
            <div className="border-b border-white/10 bg-white/[0.02] py-3.5 px-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[10px] text-brand-gray-500 uppercase tracking-widest">
                ADAPTIVE DATA OPTIMIZER V1.0.4
              </span>
              <div className="w-4 h-4 rounded bg-white/5" />
            </div>

            {/* Console Body */}
            <div className="p-6 md:p-8 space-y-6 text-left flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chaosSelection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <span className="text-brand-gray-550 text-[10px] tracking-wider uppercase block">
                      Detected Profile:
                    </span>
                    <span className="text-white text-base font-semibold font-display">
                      {chaosResponses[chaosSelection].title}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-brand-gray-550 text-[10px] tracking-wider uppercase block">
                      Usage Pattern Analysis:
                    </span>
                    <p className="text-brand-gray-300 font-light leading-relaxed">
                      {chaosResponses[chaosSelection].analysis}
                    </p>
                  </div>

                  <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <span className="text-white text-[10px] font-bold tracking-wider uppercase block mb-1">
                      Adaptive Optimization:
                    </span>
                    <p className="text-white/80 font-light leading-relaxed">
                      {chaosResponses[chaosSelection].optimization}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Console Footer */}
            <div className="border-t border-white/5 py-3 px-5 text-[9px] text-brand-gray-550 flex items-center justify-between uppercase">
              <span>Status: Listening...</span>
              <span>Memory: 12.4 MB</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

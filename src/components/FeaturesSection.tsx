import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowUpRight, HelpCircle, Users, Radio, Shield, HelpCircle as HelpIcon, HeartHandshake } from 'lucide-react';

export default function FeaturesSection() {
  // Mobile plans slider simulator
  const [dataLimit, setDataLimit] = useState(15); // 15 GB
  
  // Calculate price dynamically based on premium formula
  // e.g. Base $10 + $1 per GB, and 10% goes to local community outreach
  const calculatePrice = (gb: number) => {
    if (gb === 60) return { price: 45, label: 'Unlimited' };
    return { price: Math.floor(10 + gb * 1.5), label: `${gb} GB High-Speed` };
  };

  const { price, label } = calculatePrice(dataLimit);
  const communityFund = (price * 0.1).toFixed(2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 90,
      },
    },
  };

  return (
    <section id="features" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Dynamic ambient blur background accent */}
      <div className="absolute right-0 top-[30%] w-[50vw] h-[50vh] radial-glow-gradient pointer-events-none z-0 opacity-40" />
      <div className="absolute left-[15%] bottom-1/4 w-[400px] h-[400px] rounded-full bg-white/[0.01] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center md:text-left mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
                02 // Services
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white">
              Simplicity in Connectivity
            </h2>
          </div>
          <p className="text-sm md:text-base text-brand-gray-400 font-light max-w-md md:text-left text-center leading-relaxed">
            We stripped away the convoluted tiers, contracts, and bloated support systems. The outcome is absolute efficiency.
          </p>
        </div>

        {/* 3 Grid Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Card 1: Affordable Mobile Plans + INTERACTIVE price calculator! */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03] glow-sm hover:glow-md"
          >
            {/* Soft inner glow line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white">
                  <Radio className="w-5 h-5 text-white animate-pulse" />
                </div>
                <span className="font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">
                  01 . Interactive
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-white mb-2">
                  Affordable Mobile Plans
                </h3>
                <p className="text-sm text-brand-gray-400 font-light leading-relaxed">
                  Tailored high-speed plans operating on premium national 5G networks. Transparent monthly pricing with no strings attached.
                </p>
              </div>

              {/* Interactive pricing slider */}
              <div className="border border-white/5 rounded-xl bg-black/60 p-4 space-y-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-brand-gray-400">
                  <span>Usage Slider</span>
                  <span className="text-white font-medium">{label}</span>
                </div>

                <div className="relative pt-1">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={dataLimit}
                    onChange={(e) => setDataLimit(Number(e.target.value))}
                    className="w-full h-1 bg-brand-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-brand-gray-500 mt-1">
                    <span>5GB</span>
                    <span>15GB</span>
                    <span>30GB</span>
                    <span>UNLIMITED</span>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="text-[10px] font-mono text-brand-gray-500">ESTIMATED RATE</div>
                    <div className="font-display text-2xl font-bold text-white flex items-baseline gap-1">
                      ${price}
                      <span className="text-xs font-light text-brand-gray-400 font-sans">/mo</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono text-brand-gray-500">COMMUNITY BENEFIT</div>
                    <div className="text-xs font-mono text-white/90 font-medium">
                      +${communityFund}/mo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs text-brand-gray-400 group-hover:text-white transition-colors">
              <span>View Core Network Coverage</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </motion.div>

          {/* Card 2: Community Connectivity Programs */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03] glow-sm hover:glow-md"
          >
            {/* Soft inner glow line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">
                  02 . Local Impact
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-white mb-2">
                  Community Programs
                </h3>
                <p className="text-sm text-brand-gray-400 font-light leading-relaxed mb-4">
                  10% of every mobile invoice is automatically funneled back into localized digital equity grants and connectivity infrastructure partnerships.
                </p>
                <p className="text-sm text-brand-gray-400 font-light leading-relaxed">
                  We deploy localized community Wi-Fi hubs, fund connection subsidies for senior community centers, and bridge gaps for schools in need.
                </p>
              </div>

              {/* Decorative mini telemetry values */}
              <div className="grid grid-cols-2 gap-4 border border-white/5 rounded-xl bg-black/40 p-4 text-left font-mono">
                <div>
                  <div className="text-[9px] text-brand-gray-550">TOTAL HUB COVERAGE</div>
                  <div className="text-sm font-semibold text-white mt-0.5">2,482 Active</div>
                </div>
                <div>
                  <div className="text-[9px] text-brand-gray-550">DIRECT SUBSIDIES</div>
                  <div className="text-sm font-semibold text-white mt-0.5">8,400+ Users</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs text-brand-gray-400 group-hover:text-white transition-colors">
              <span>Community Impact Registry</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </motion.div>

          {/* Card 3: Fast & Reliable Support */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03] glow-sm hover:glow-md"
          >
            {/* Soft inner glow line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">
                  03 . 100% Human
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-white mb-2">
                  Fast & Reliable Support
                </h3>
                <p className="text-sm text-brand-gray-400 font-light leading-relaxed mb-4">
                  Bypass the automated phone systems, circular bot directories, and artificial delays. At PacMac, your ticket routes immediately to real technicians.
                </p>
                <p className="text-sm text-brand-gray-400 font-light leading-relaxed">
                  Our regional support teams are stationed locally, understands network topologies deeply, and boasts a median response threshold under 3 minutes.
                </p>
              </div>

              {/* Graphic checklist */}
              <div className="space-y-2 font-mono text-[11px] text-brand-gray-300 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>No automated circular loops</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>3-Minute Mean Response Threshold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Empowered Regional Technicians</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs text-brand-gray-400 group-hover:text-white transition-colors">
              <span>Read Our Support Pledge</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}

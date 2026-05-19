import React from 'react';
import { motion } from 'motion/react';
import { Heart, Globe, Users, ShieldAlert } from 'lucide-react';

export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 90,
      },
    },
  };

  return (
    <section id="about" className="relative py-24 md:py-36 px-6 md:px-12 bg-black overflow-hidden border-b border-white/5">
      {/* Structural decoration: elegant vertical border layout lines */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      <div className="max-w-7xl mx-auto md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Text content side */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7 space-y-8"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
                01 // Philosophy
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-display text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white"
            >
              Built for Real People
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-brand-gray-400 font-sans font-light leading-relaxed max-w-2xl"
            >
              PacMac Mobile is focused on making wireless access simpler, more affordable, and more human. We’re building a modern connectivity platform designed around community outreach, accessibility, and seamless service.
            </motion.p>

            {/* Minor values grid for the VC startup vibe */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/5"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-gray-300" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white tracking-tight">
                    Radical Inclusivity
                  </h4>
                  <p className="text-xs text-brand-gray-400 mt-1 leading-relaxed">
                    Committed to providing premium high-speed access to those historically overlooked by tech conglomerates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-brand-gray-300" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white tracking-tight">
                    De-Complicated Telecom
                  </h4>
                  <p className="text-xs text-brand-gray-400 mt-1 leading-relaxed">
                    Zero activation fees, zero lock-ins, zero mysterious "regulatory additions". One price, fully explained.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive schematic/blueprint illustration side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 25, stiffness: 80, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            {/* Soft decorative glow */}
            <div className="absolute inset-0 bg-white/[0.02] rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative border border-white/10 rounded-3xl bg-black/50 p-6 md:p-8 backdrop-blur-sm shadow-xl aspect-square flex flex-col justify-between overflow-hidden">
              
              {/* Minimal mesh pattern inside card */}
              <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

              {/* Blueprint headers */}
              <div className="flex items-start justify-between font-mono text-[9px] text-brand-gray-500 uppercase tracking-widest relative z-10">
                <div>
                  [PACMAC // PLATFORM CORE]
                  <div className="text-brand-gray-400 font-bold mt-0.5">V0.94 BETA</div>
                </div>
                <div className="text-right">
                  SIGNAL ENGINE
                  <div className="text-white mt-0.5">99.9% UPTIME</div>
                </div>
              </div>

              {/* Moving wave line animation or schematic representation */}
              <div className="my-auto py-8 flex flex-col items-center justify-center relative z-10">
                <div className="relative w-full h-24 flex items-center justify-center">
                  {/* Subtle vector nodes representation */}
                  <div className="absolute left-1/4 w-3 h-3 rounded-full bg-white border-4 border-black box-content glow-sm" />
                  <div className="absolute right-1/4 w-3 h-3 rounded-full bg-white border-4 border-black box-content glow-sm" />
                  <div className="absolute top-1/4 w-2 h-2 rounded-full bg-brand-gray-600" />
                  <div className="absolute bottom-1/4 w-2 h-2 rounded-full bg-brand-gray-650" />
                  
                  {/* Glowing interconnecting lines */}
                  <svg className="w-full h-full text-white/10" viewBox="0 0 300 100">
                    <line x1="75" y1="50" x2="225" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M 75 50 Q 150 10 225 50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                    <path d="M 75 50 Q 150 90 225 50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  </svg>
                  
                  {/* Core hub indicator */}
                  <div className="absolute w-12 h-12 rounded-full border border-white/20 bg-black/60 flex items-center justify-center backdrop-blur-md">
                    <Globe className="w-5 h-5 text-white/80 animate-pulse" />
                  </div>
                </div>
                <div className="text-center mt-6">
                  <span className="font-mono text-[10px] text-brand-gray-400 uppercase tracking-widest">
                    Local Node Decentralization
                  </span>
                  <p className="text-[11px] text-brand-gray-500 mt-1 max-w-xs leading-relaxed">
                    Deploying macro cell coverage networks with localized municipal partnerships.
                  </p>
                </div>
              </div>

              {/* Core summary footer inside schematic box */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[10px] font-mono text-brand-gray-400 relative z-10">
                <span>EST: 2026</span>
                <span>LATENCY: ~18MS</span>
                <span className="text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  ONLINE
                </span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

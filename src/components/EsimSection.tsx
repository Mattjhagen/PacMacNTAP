import React from 'react';
import { motion } from 'motion/react';
import { QrCode, Smartphone, Zap, Sparkles } from 'lucide-react';

export default function EsimSection() {
  const steps = [
    {
      icon: <Zap className="w-5 h-5 text-white" />,
      title: 'Generate Profile',
      desc: 'Select your data profile, check carrier compatibility, and complete checkout in under 90 seconds.'
    },
    {
      icon: <QrCode className="w-5 h-5 text-white" />,
      title: 'Scan QR Code',
      desc: 'Scan the secure QR code sent to your screen or email. Your phone installs the profile in seconds.'
    },
    {
      icon: <Smartphone className="w-5 h-5 text-white" />,
      title: 'Connect Instantly',
      desc: 'Your PacMac 5G connection starts working immediately. No physical cards, no waiting for shipping.'
    }
  ];

  return (
    <section id="esim" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Glow backdrop behind QR section */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[550px] h-[350px] bg-white/[0.012] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
              04 // MODERN ESIM TECHNOLOGY
            </span>
            <div className="h-[1px] w-12 bg-brand-gray-800" />
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
            Activate in minutes. <br />Like it’s 2026.
          </h2>
          
          <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed max-w-lg mx-auto">
            Scan a QR code. Get connected. Avoid the mall. You could literally switch carriers during lunch.
          </p>
        </div>

        {/* Dynamic Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Steps (Left) */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white transition-all group-hover:border-white/30">
                  {step.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-sm font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-gray-450 font-sans font-light leading-relaxed max-w-sm">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Graphical Mockup (Right) */}
          <div className="lg:col-span-6 flex items-center justify-center">
            
            {/* Holographic QR Code Box */}
            <div className="w-80 h-80 rounded-2xl border border-white/10 bg-white/[0.01] backdrop-blur-md relative flex items-center justify-center group overflow-hidden shadow-2xl">
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none z-10" />
              
              {/* Scanning laser line animation */}
              <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent top-0 animate-grid-drift z-10 shadow-[0_0_15px_rgba(255,255,255,0.4)]" />

              {/* Glowing background circles */}
              <div className="absolute w-44 h-44 rounded-full bg-white/[0.015] blur-2xl group-hover:bg-white/[0.03] transition-colors pointer-events-none" />

              {/* Vector Simulated QR Code SVG */}
              <div className="relative z-10 w-44 h-44 border border-white/20 rounded-xl p-4 bg-black/90 flex flex-col justify-between transition-transform duration-500 group-hover:scale-105">
                <div className="flex justify-between w-full h-full p-1 opacity-80">
                  {/* Outer corner squares */}
                  <div className="w-8 h-8 border-2 border-white rounded" />
                  <div className="w-8 h-8 border-2 border-white rounded" />
                </div>
                <div className="flex justify-between w-full h-full p-1 opacity-80 mt-auto">
                  <div className="w-8 h-8 border-2 border-white rounded" />
                  {/* Smaller mock modules */}
                  <div className="w-6 h-6 border-2 border-dashed border-white/50 rounded flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                  </div>
                </div>

                {/* Central brand mark logo inside QR */}
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-lg border border-white/10 bg-black flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>

                {/* Simulating random QR module dots inside background */}
                <div className="absolute inset-4 border border-white/[0.05] border-dashed rounded pointer-events-none flex flex-wrap gap-1 p-2 justify-center content-center opacity-30 select-none font-mono text-[6px]">
                  <span>0101 1001 0110 1100 0011 1101 1010</span>
                </div>
              </div>

              {/* Holographic text bottom bar */}
              <div className="absolute bottom-4 inset-x-0 text-center font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest">
                [ QR PROVISIONING ACTIVE ]
              </div>
            </div>

          </div>

        </div>

        {/* Microcopy Quote */}
        <div className="text-center font-mono text-[10px] text-brand-gray-500 max-w-xl mx-auto border-t border-white/5 pt-8 space-y-1">
          <p>“Physical SIM cards are starting to feel emotionally outdated.”</p>
          <p className="opacity-60">— Tiny QR code, big telecom energy.</p>
        </div>

      </div>
    </section>
  );
}

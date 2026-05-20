import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from './HeroSection';
import WhatIsPacMac from './WhatIsPacMac';
import ComingSoonSection from './ComingSoonSection';
import WaitlistSection from './WaitlistSection';
import { ArrowRight, Smartphone, Cpu, QrCode, Sparkles, Shield, Lock } from 'lucide-react';

export default function HomeView() {
  return (
    <div className="space-y-0">
      {/* 00 // HERO */}
      <HeroSection />

      {/* 01 // MISSION MATRIX */}
      <WhatIsPacMac />

      {/* PLATFORM PREVIEWS - Quick high-fidelity cards that link to dedicated pages */}
      <section className="relative py-24 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
        <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
        <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] radial-glow-gradient pointer-events-none opacity-20" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest block">
              PACMAC CORE PLATFORM
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              A real telecom platform. <br />Already partially operational.
            </h2>
            <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light max-w-md mx-auto">
              Click on any of our operational portal links below or use the navigation menu to explore real simulated interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Phone Store Card */}
            <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group text-left">
              <div className="space-y-4">
                <Smartphone className="w-6 h-6 text-white" />
                <h3 className="font-display text-lg font-bold text-white">Phones Marketplace</h3>
                <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                  "Tiny supercomputers with commitment issues." Browse Pro Ultra, Light, and E-Ink Zero devices with outright and financing pricing.
                </p>
              </div>
              <Link
                to="/phones"
                className="mt-6 font-mono text-[10px] text-white flex items-center gap-1.5 hover:underline"
              >
                Launch Storefront
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* BYOP Card */}
            <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group text-left">
              <div className="space-y-4">
                <Cpu className="w-6 h-6 text-white" />
                <h3 className="font-display text-lg font-bold text-white">Bring Your Own Phone</h3>
                <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                  "No fluorescent carrier store energy." Run instant IMEI diagnostics checks and select physical or eSIM onboarding paths.
                </p>
              </div>
              <Link
                to="/byop"
                className="mt-6 font-mono text-[10px] text-white flex items-center gap-1.5 hover:underline"
              >
                Run Device Check
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* eSIM Activation */}
            <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group text-left">
              <div className="space-y-4">
                <QrCode className="w-6 h-6 text-white" />
                <h3 className="font-display text-lg font-bold text-white">Instant eSIM Activation</h3>
                <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                  "Tiny QR code. Massive convenience." Switch cellular providers instantly via secure QR code scans. Try it during your lunch break.
                </p>
              </div>
              <Link
                to="/esim"
                className="mt-6 font-mono text-[10px] text-white flex items-center gap-1.5 hover:underline"
              >
                Provision eSIM
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Adaptive Plans */}
            <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group text-left">
              <div className="space-y-4">
                <Sparkles className="w-6 h-6 text-white" />
                <h3 className="font-display text-lg font-bold text-white">Adaptive AI Plans</h3>
                <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                  "Like Progressive Snapshot, but for your phone bill." Test your usage patterns on our billing AI and try the Chaos Analyzer tool.
                </p>
              </div>
              <Link
                to="/plans"
                className="mt-6 font-mono text-[10px] text-white flex items-center gap-1.5 hover:underline"
              >
                Analyze My Usage
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* AI Support preview */}
            <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group text-left">
              <div className="space-y-4">
                <Shield className="w-6 h-6 text-white" />
                <h3 className="font-display text-lg font-bold text-white">AI Support assistant</h3>
                <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                  "Smarter than carrier support. Empathy included." Run network resets, verify identities, swap SIMs, or create human escalations.
                </p>
              </div>
              <Link
                to="/support"
                className="mt-6 font-mono text-[10px] text-white flex items-center gap-1.5 hover:underline"
              >
                Open Support Assistant
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Mesh Messenger */}
            <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group text-left">
              <div className="space-y-4">
                <Lock className="w-6 h-6 text-white" />
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-white">Mesh Messenger</h3>
                  <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                    Private messaging. Coming soon.
                  </span>
                </div>
                <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                  End-to-end encrypted messaging for people who miss when the internet felt a little more private. Built for members, not advertisers.
                </p>
              </div>
              <a
                href="https://github.com/Mattjhagen/mesh-messenger"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 font-mono text-[10px] text-white flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                View Repository
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 09 // COUNTDOWN CHRONOLOGY */}
      <ComingSoonSection />

      {/* 10 // EARLY ACCESS WAITLIST */}
      <WaitlistSection />
    </div>
  );
}

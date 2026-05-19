import React from 'react';
import { Shield, Sparkles, MapPin, Radio } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/5 py-12 md:py-16 px-6 md:px-12 overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/5">
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 font-display text-lg font-bold text-white">
            <div className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-white" />
            </div>
            <span>
              PacMac<span className="font-light text-brand-gray-400"> Mobile</span>
            </span>
          </div>

          {/* Subtext description */}
          <p className="text-xs text-brand-gray-500 max-w-sm text-center md:text-right leading-relaxed font-mono">
            [PACMAC MOBILE INC.] DESIGNED TO BRIDGE ACCESS GAP IN OVERLOOKED COMMUNITIES. ALL CONNECTIONS ENCRYPTED.
          </p>
        </div>

        {/* Copyright, coordinate statistics, domain details */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 text-[11px] font-mono text-brand-gray-500">
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6">
            <span>© {currentYear} PacMac Mobile. All rights reserved.</span>
            <a href="https://pacmacmobile.com" className="hover:text-white transition-colors">
              pacmacmobile.com
            </a>
          </div>

          {/* Meta technical telemetry metrics */}
          <div className="flex items-center gap-4 text-brand-gray-600">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              NORTH AMER. DEPLOYMENTS
            </span>
            <span className="h-3 w-[1px] bg-white/5" />
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              SECURE SIP CORE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

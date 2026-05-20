import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Scan, ArrowRight, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';

export default function ESIMExperienceSection() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Subtle light leak gradient */}
      <div className="absolute right-10 bottom-10 w-[500px] h-[400px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
          
          {/* Diagnostic Display (Left) */}
          <div className="lg:col-span-7 flex justify-center items-center">
            
            <div className="w-full max-w-md border border-white/10 bg-white/[0.01] rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-[9px] text-emerald-400 tracking-wider">PROVISIONING SECURE SERVER READY</span>
                </div>
                <span className="font-mono text-[9px] text-brand-gray-500">eSIM BLOCK #1904</span>
              </div>

              {/* Holographic QR screen */}
              <div className="w-full aspect-square border border-white/5 rounded-2xl bg-black/60 relative flex flex-col items-center justify-center p-8 group">
                {/* Scanner horizontal line */}
                <div className="absolute left-6 right-6 h-[1.5px] bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.8)] top-6 animate-scanner pointer-events-none" />
                
                {/* QR box */}
                <div className="w-48 h-48 border border-white/10 rounded-xl flex items-center justify-center p-3 relative bg-white/[0.01]">
                  
                  {/* Decorative corners */}
                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t border-l border-white" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t border-r border-white" />
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b border-l border-white" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b border-r border-white" />

                  <QrCode className="w-full h-full text-white/90" />
                </div>

                <span className="font-mono text-[10px] text-brand-gray-400 mt-6 block text-center">
                  Scan QR code to install simulated profile
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 font-mono text-[10px]">
                <div className="text-left">
                  <span className="text-brand-gray-550 block uppercase">Manual Code ID</span>
                  <span className="text-white block font-medium">LPA:1.PACMACMOBILE.COM$TEST-TOKEN-9940</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="py-2 px-3 border border-white/10 hover:border-white/30 text-white rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

            </div>

          </div>

          {/* Text/Content (Right) */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
                CELLULAR EVOLUTION // eSIM OVERVIEW
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight">
              Tiny QR code. <br />Massive convenience.
            </h1>

            <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed">
              Physical SIM cards are entering their fax machine and floppy disk era. With eSIM, your connection is 100% digital. No shipping delays, no searching for a paperclip to poke into your phone, and no waiting in fluorescent carrier stores. You could literally switch carriers during your lunch break.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex gap-4 p-4 border border-white/5 bg-white/[0.01] rounded-2xl">
                <Scan className="w-6 h-6 text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-display text-xs font-semibold text-white">Instant Switch Over</h4>
                  <p className="text-[11px] text-brand-gray-450 font-light leading-relaxed">
                    Check compatibility, select your plan, scan the generated code, and boot into high-speed 5G.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 border border-white/5 bg-white/[0.01] rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-display text-xs font-semibold text-white">Dual Plan Co-Existence</h4>
                  <p className="text-[11px] text-brand-gray-450 font-light leading-relaxed">
                    Keep your primary work number active while testing PacMac Mobile on your secondary eSIM line slot.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => navigate('/byop')}
                className="py-3.5 px-6 text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.08)]"
              >
                Launch Activation Onboarding
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

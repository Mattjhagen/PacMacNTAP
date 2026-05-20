import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, CheckCircle, Ship, Scan, Cpu, Loader2, ArrowRight } from 'lucide-react';

export default function ByopSection() {
  const [imei, setImei] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'invalid'>('idle');
  const [simType, setSimType] = useState<'esim' | 'physical'>('esim');

  const checkCompatibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei.trim()) return;
    
    setChecking(true);
    setStatus('idle');
    
    setTimeout(() => {
      setChecking(false);
      // Simulating a successful verification unless it's too short
      if (imei.length >= 14) {
        setStatus('success');
      } else {
        setStatus('invalid');
      }
    }, 1800);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setChecking(true);
    setStatus('idle');
    setTimeout(() => {
      setChecking(false);
      setStatus('success');
    }, 1200);
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
    <section id="byop" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Background visual accent */}
      <div className="absolute left-10 bottom-20 w-[450px] h-[350px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text/Subtext (Left) */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
                03 // BRING YOUR OWN PHONE (BYOP)
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Already love your phone? <br />
              Cool. Keep it.
            </h2>

            <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed">
              Bring your own device and escape your current carrier without the emotional damage. Instant eSIM lets you switch in minutes right from your desk.
            </p>

            <div className="space-y-4 pt-4 font-mono text-xs text-brand-gray-450">
              <div className="flex items-start gap-2.5">
                <span className="text-white font-bold">[✓]</span>
                <span>Your phone deserves a better carrier.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-white font-bold">[✓]</span>
                <span>No carrier store fluorescent lighting required.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-white font-bold">[✓]</span>
                <span>Switching should not feel like filing taxes.</span>
              </div>
            </div>
          </div>

          {/* Compatibility Checker Module (Right) */}
          <div className="lg:col-span-7 border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md text-left">
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Check Carrier Compatibility
                </h3>
                <p className="text-xs text-brand-gray-400 font-light mt-1">
                  Select your device brand or type your 15-digit IMEI number below.
                </p>
              </div>

              {/* Brand Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {['Apple iPhone', 'Samsung Galaxy', 'Google Pixel', 'Other Brand'].map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBrandSelect(b)}
                    className={`py-2 px-1 rounded-xl border font-mono text-[9px] text-center transition-all cursor-pointer truncate ${
                      selectedBrand === b
                        ? 'border-white text-black bg-white'
                        : 'border-white/10 text-brand-gray-300 hover:border-white/30 bg-transparent'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* IMEI Input Form */}
              <form onSubmit={checkCompatibility} className="flex gap-2">
                <input
                  type="text"
                  maxLength={15}
                  value={imei}
                  onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 15-digit IMEI number"
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="py-3 px-5 text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 disabled:bg-brand-gray-700 disabled:text-brand-gray-400 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  {checking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Check IMEI
                </button>
              </form>

              {/* Status Output */}
              <AnimatePresence mode="wait">
                {checking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3 text-xs font-mono text-brand-gray-400"
                  >
                    <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                    <span>Accessing provisioning database. Verifying compatibility...</span>
                  </motion.div>
                )}

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-4"
                  >
                    <div className="flex items-center gap-2.5 text-xs font-mono text-white">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span>Device Compatible! High-speed eSIM ready.</span>
                    </div>

                    {/* Choose SIM Type */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSimType('esim')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          simType === 'esim'
                            ? 'border-white bg-white/[0.02] shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                            : 'border-white/10 bg-transparent hover:border-white/20'
                        }`}
                      >
                        <Scan className="w-4 h-4 text-white mb-2" />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">Instant eSIM</span>
                          <span className="text-[10px] text-brand-gray-400 font-light block">Download in 5 minutes</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSimType('physical')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          simType === 'physical'
                            ? 'border-white bg-white/[0.02] shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                            : 'border-white/10 bg-transparent hover:border-white/20'
                        }`}
                      >
                        <Cpu className="w-4 h-4 text-white mb-2" />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">Physical SIM</span>
                          <span className="text-[10px] text-brand-gray-400 font-light block">Ships free in 2 days</span>
                        </div>
                      </button>
                    </div>

                    {/* Proceed Button */}
                    <button
                      onClick={handleScrollToWaitlist}
                      className="w-full mt-4 py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {simType === 'esim' ? 'Download Activation QR Code' : 'Order Physical SIM Card'}
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </motion.div>
                )}

                {status === 'invalid' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.02] text-xs font-mono text-red-200"
                  >
                    <span>IMEI invalid or too short. Please input a valid 15-digit code or click a brand button above to simulate compatibility check.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

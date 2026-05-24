import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Check, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../utils/storage';

export default function BYOP() {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState('');
  const [imei, setImei] = useState('');
  const [carrier, setCarrier] = useState('');
  const [simType, setSimType] = useState<'eSIM' | 'Physical SIM'>('eSIM');
  
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleDeviceCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) {
      setErrorMsg("Please select your device brand.");
      return;
    }
    if (imei.length < 14) {
      setErrorMsg("Please enter a valid 14 or 15 digit IMEI number.");
      return;
    }
    
    setErrorMsg('');
    setIsChecking(true);
    // Simulate database lookup of network bands
    setTimeout(() => {
      setIsChecking(false);
      setStep(2);
    }, 1500);
  };

  const handleCarrierCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier) {
      setErrorMsg("Please select your carrier.");
      return;
    }
    
    setErrorMsg('');
    setIsChecking(true);
    // Simulate unlocking verification
    setTimeout(() => {
      setIsChecking(false);
      setStep(3);
    }, 1200);
  };

  const handleSimSelection = () => {
    addToCart({
      type: 'byop',
      name: `BYOP Line Configuration (${simType})`,
      price: 0 // Setup fee is free
    });
    // Store SIM choice in sessionStorage to transfer to Checkout success
    sessionStorage.setItem('pacmac_checkout_sim', simType);
    sessionStorage.setItem('pacmac_checkout_device', brand ? `${brand} (BYOP)` : 'BYOP Phone');
    navigate('/checkout');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24">
      {/* Background visual drift */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-xl mx-auto px-6 pt-32 md:pt-40">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest">
          <span>Bring your own phone</span>
          <span>Step {step} of 3</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  Check your phone's compatibility.
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400 font-light">
                  Most modern unlocked phones support our high-speed 5G network bands. Let's make sure.
                </p>
              </div>

              <form onSubmit={handleDeviceCheck} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                    Device Manufacturer
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Apple', 'Google', 'Samsung'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBrand(b);
                          setErrorMsg('');
                        }}
                        className={`py-2.5 rounded border text-xs font-medium transition-all ${
                          brand === b
                            ? 'bg-white text-black border-white'
                            : 'bg-neutral-950 border-white/10 text-brand-gray-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="imei" className="block text-[10px] font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                    IMEI Code
                  </label>
                  <input
                    id="imei"
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    placeholder="Enter 14-15 digit IMEI"
                    className="w-full bg-neutral-950 border border-white/10 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition-all font-mono"
                  />
                  <span className="block text-[9px] text-brand-gray-500 font-mono mt-1.5">
                    Dial *#06# on your device to display your IMEI.
                  </span>
                </div>

                {errorMsg && (
                  <p className="text-xs font-mono text-white bg-red-950/20 border border-red-500/10 p-3 rounded">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isChecking}
                  className="w-full py-3.5 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isChecking ? "Querying line diagnostic databases..." : "Check Compatibility"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  Verify Unlocked Status.
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400 font-light">
                  To swap network providers, your device must not be locked by your current carrier contract.
                </p>
              </div>

              <form onSubmit={handleCarrierCheck} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                    Current Carrier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['AT&T', 'Verizon', 'T-Mobile', 'Other'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCarrier(c);
                          setErrorMsg('');
                        }}
                        className={`py-2.5 rounded border text-xs font-medium transition-all ${
                          carrier === c
                            ? 'bg-white text-black border-white'
                            : 'bg-neutral-950 border-white/10 text-brand-gray-400 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-neutral-900/30 border border-white/5 p-4 flex gap-3.5 items-start">
                  <ShieldCheck className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                    If you bought your phone outright, it's already unlocked. If you finance it, call your carrier or request an unlock through their portal. We can port your current number.
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-xs font-mono text-white bg-red-950/20 border border-red-500/10 p-3 rounded">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 text-center text-sm font-mono border border-white/10 hover:border-white/20 rounded-lg transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isChecking}
                    className="flex-1 py-3 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isChecking ? "Checking lock state..." : "Lock Status Verified"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  Select your SIM layout.
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400 font-light">
                  How do you want to connect? eSIM acts instantly, while physical SIMs are mailed.
                </p>
              </div>

              <div className="space-y-4">
                {/* eSIM Selection */}
                <button
                  type="button"
                  onClick={() => setSimType('eSIM')}
                  className={`w-full text-left p-5 rounded-xl border transition-all flex justify-between items-center ${
                    simType === 'eSIM'
                      ? 'bg-neutral-900 border-white text-white shadow-md'
                      : 'bg-neutral-950/40 border-white/5 text-brand-gray-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold mb-1">eSIM (Immediate activation)</h3>
                    <p className="text-xs text-brand-gray-400 font-light max-w-sm leading-relaxed">
                      Download cellular profiles over-the-air. Connect in under 3 minutes. Clean, fast, zero plastic garbage.
                    </p>
                  </div>
                  {simType === 'eSIM' && <Check className="w-5 h-5 text-white" />}
                </button>

                {/* Physical SIM Selection */}
                <button
                  type="button"
                  onClick={() => setSimType('Physical SIM')}
                  className={`w-full text-left p-5 rounded-xl border transition-all flex justify-between items-center ${
                    simType === 'Physical SIM'
                      ? 'bg-neutral-900 border-white text-white shadow-md'
                      : 'bg-neutral-950/40 border-white/5 text-brand-gray-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Physical SIM (Next-day delivery)</h3>
                    <p className="text-xs text-brand-gray-400 font-light max-w-sm leading-relaxed">
                      Classic plastic SIM tray format. Shipped overnight in a cardboard sleeve. Fits older or legacy handset slots.
                    </p>
                  </div>
                  {simType === 'Physical SIM' && <Check className="w-5 h-5 text-white" />}
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 text-center text-sm font-mono border border-white/10 hover:border-white/20 rounded-lg transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSimSelection}
                  className="flex-1 py-3 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Continue to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

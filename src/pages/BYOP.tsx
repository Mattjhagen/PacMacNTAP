import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Check, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, HelpCircle, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../utils/storage';
import ImeiInput from '../components/ImeiInput';
import { compatibilityService, CompatibilityResult } from '../services/compatibilityService';

export default function BYOP() {
  const [step, setStep] = useState(1); // 1: Choose BYOP vs Buy, 2: Enter IMEI, 3: Compatibility results & SIM select
  const [imei, setImei] = useState('');
  const [isImeiValidFormat, setIsImeiValidFormat] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkingStep, setCheckingStep] = useState('');
  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null);
  const [simType, setSimType] = useState<'eSIM' | 'Physical SIM'>('eSIM');
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleChooseBYOP = () => {
    setStep(2);
  };

  const handleChooseBuy = () => {
    navigate('/phones');
  };

  const handleVerifyDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isImeiValidFormat) return;

    setIsChecking(true);
    setErrorMsg('');
    setCheckingStep('Reading device identifiers...');
    
    setTimeout(() => {
      setCheckingStep('Verifying cellular band configurations...');
    }, 500);

    setTimeout(() => {
      setCheckingStep('Checking eSIM hardware profiles...');
    }, 1000);

    try {
      const result = await compatibilityService.checkCompatibility(imei);
      setCompatResult(result);
      // Auto-select physical SIM if device is not eSIM capable
      if (!result.isEsimCapable) {
        setSimType('Physical SIM');
      } else {
        setSimType('eSIM');
      }
      setStep(3);
    } catch (err: any) {
      setErrorMsg("We couldn't connect to the device compatibility registry. Please check your network connection and try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSimSelectionSubmit = () => {
    if (!compatResult) return;

    addToCart({
      type: 'byop',
      name: `BYOP Line (${compatResult.brand} ${compatResult.model} - ${simType})`,
      price: 0 // Setup fee is free
    });

    // Store compatibility results in onboarding session state (sessionStorage)
    sessionStorage.setItem('pacmac_checkout_sim', simType);
    sessionStorage.setItem('pacmac_checkout_device', `${compatResult.brand} ${compatResult.model}`);
    sessionStorage.setItem('pacmac_checkout_imei', imei);
    sessionStorage.setItem('pacmac_onboarding_device_result', JSON.stringify({
      imei,
      brand: compatResult.brand,
      model: compatResult.model,
      compatibility_status: compatResult.isCompatible ? (compatResult.isLocked ? 'locked' : 'compatible') : 'unsupported',
      sim_type: simType,
      is_esim_capable: compatResult.isEsimCapable,
      activation_readiness: compatResult.readiness === 'esim_ready' ? 'Ready (eSIM)' : compatResult.readiness === 'physical_ready' ? 'Ready (Physical)' : compatResult.readiness === 'locked' ? 'Requires Unlock' : 'Not Eligible'
    }));

    navigate('/checkout');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-16 sm:pb-24 font-sans font-light">
      {/* Background radial drift */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-xl mx-auto px-6 pt-24 sm:pt-32 md:pt-40">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-white/5 pb-4 font-mono text-[8px] sm:text-[9px] text-brand-gray-500 uppercase tracking-widest select-none">
          <span>Device Configuration</span>
          <span>Step {step} of 3</span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Bring Your Own vs Buy a Phone */}
          {step === 1 && (
            <motion.div
              key="step-choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 animate-fade-in"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  First, let's set up your phone.
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400">
                  How would you like to connect to the PacMac network?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* BYOP Card */}
                <button
                  onClick={handleChooseBYOP}
                  className="w-full text-left p-6 rounded-xl border border-white/5 bg-neutral-950/40 hover:border-white/20 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mb-4 text-white group-hover:bg-white group-hover:text-black transition-colors">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1.5 group-hover:translate-x-0.5 transition-transform">
                      Bring Your Own Phone
                    </h3>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Check your hardware compatibility instantly. Most unlocked modern devices work perfectly. No fluorescent carrier store energy required.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-[11px] font-mono text-white/50 group-hover:text-white transition-colors">
                    Check compatibility <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Buy Card */}
                <button
                  onClick={handleChooseBuy}
                  className="w-full text-left p-6 rounded-xl border border-white/5 bg-neutral-950/40 hover:border-white/20 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mb-4 text-white group-hover:bg-white group-hover:text-black transition-colors">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1.5 group-hover:translate-x-0.5 transition-transform">
                      Buy a New Device
                    </h3>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Choose from our curated collection of clean, unlocked handsets including Pixel, iPhone, and the minimalist PacMac Pebble. Pre-loaded with zero bloat.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-[11px] font-mono text-white/50 group-hover:text-white transition-colors">
                    Explore storefront <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Request IMEI */}
          {step === 2 && (
            <motion.div
              key="step-imei"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  Let's make sure your phone plays nice.
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400">
                  Most unlocked devices work fine. We'll run a quick checks to verify your antenna bands and eSIM capabilities.
                </p>
              </div>

              <form onSubmit={handleVerifyDevice} className="space-y-6">
                <ImeiInput
                  value={imei}
                  disabled={isChecking}
                  onChange={(val, valid) => {
                    setImei(val);
                    setIsImeiValidFormat(valid);
                  }}
                />

                {errorMsg && (
                  <div className="border border-red-500/10 bg-red-950/20 text-red-400 p-4 rounded-lg text-xs leading-relaxed text-center font-mono select-none">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {isChecking ? (
                  <div className="border border-white/5 bg-neutral-950/60 rounded-xl p-6 text-center py-10 space-y-4">
                    <RefreshCw className="w-6 h-6 text-white animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-white">Analyzing configuration...</p>
                      <p className="text-[10px] font-mono text-brand-gray-500">{checkingStep}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 text-center text-xs font-mono border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isImeiValidFormat}
                      className="flex-1 py-3.5 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      Check Compatibility
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          )}

          {/* STEP 3: Compatibility Results & SIM Layout */}
          {step === 3 && compatResult && (
            <motion.div
              key="step-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  Compatibility Report
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400">
                  Here's what we detected about your device status.
                </p>
              </div>

              {/* Status Card */}
              <div className={`border rounded-xl p-5 ${
                !compatResult.isCompatible
                  ? 'border-red-500/20 bg-red-950/5 text-red-400'
                  : compatResult.isLocked
                    ? 'border-yellow-500/20 bg-yellow-950/5 text-yellow-400'
                    : 'border-white/10 bg-neutral-950/40 text-white'
              }`}>
                <div className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    !compatResult.isCompatible
                      ? 'bg-red-500/10 text-red-500'
                      : compatResult.isLocked
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-white/10 text-white'
                  }`}>
                    {compatResult.isCompatible && !compatResult.isLocked ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
                      {!compatResult.isCompatible
                        ? 'Incompatible Hardware'
                        : compatResult.isLocked
                          ? 'Locked Carrier'
                          : compatResult.isEsimCapable
                            ? 'Ready for eSIM'
                            : 'Ready for Physical SIM'}
                    </h4>
                    <p className="text-[11px] font-mono text-brand-gray-400">
                      Handset: {compatResult.brand} {compatResult.model} • IMEI: ...{imei.slice(-4)}
                    </p>
                    <p className="text-xs text-brand-gray-300 font-light leading-relaxed pt-2">
                      {compatResult.message}
                    </p>
                  </div>
                </div>
              </div>

              {compatResult.isCompatible && (
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
                    Select SIM Delivery
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {/* eSIM Selection */}
                    <button
                      type="button"
                      disabled={!compatResult.isEsimCapable}
                      onClick={() => setSimType('eSIM')}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                        !compatResult.isEsimCapable
                          ? 'opacity-40 cursor-not-allowed border-white/5 bg-neutral-950/20'
                          : simType === 'eSIM'
                            ? 'bg-neutral-900 border-white text-white'
                            : 'bg-neutral-950/40 border-white/5 text-brand-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="max-w-[85%]">
                        <span className="text-xs font-semibold block">eSIM (Immediate activation)</span>
                        <span className="text-[10px] text-brand-gray-400 font-light mt-0.5 block leading-normal">
                          {compatResult.isEsimCapable
                            ? 'Configure cellular profile instantly. Online in under 3 minutes. Zero plastic waste.'
                            : 'Not supported by this specific handset.'}
                        </span>
                      </div>
                      {simType === 'eSIM' && <Check className="w-4 h-4 text-white" />}
                    </button>

                    {/* Physical SIM Selection */}
                    <button
                      type="button"
                      onClick={() => setSimType('Physical SIM')}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                        simType === 'Physical SIM'
                          ? 'bg-neutral-900 border-white text-white'
                          : 'bg-neutral-950/40 border-white/5 text-brand-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="max-w-[85%]">
                        <span className="text-xs font-semibold block">Physical SIM (Next-day delivery)</span>
                        <span className="text-[10px] text-brand-gray-400 font-light mt-0.5 block leading-normal">
                          Classic plastic SIM tray format. Shipped overnight in a cardboard sleeve. Fits older handset slots.
                        </span>
                      </div>
                      {simType === 'Physical SIM' && <Check className="w-4 h-4 text-white" />}
                    </button>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 text-center text-xs font-mono border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSimSelectionSubmit}
                      className="flex-1 py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Continue to Checkout
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {!compatResult.isCompatible && (
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 text-center text-xs font-mono border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer"
                  >
                    Back to IMEI Check
                  </button>
                  <button
                    type="button"
                    onClick={handleChooseBuy}
                    className="flex-1 py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Browse Compatible Devices
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Check, ArrowRight, AlertCircle, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../utils/storage';
import ImeiInput from '../components/ImeiInput';
import { compatibilityService, CompatibilityResult } from '../services/compatibilityService';

export default function BYOP() {
  const [step, setStep] = useState(1);
  const [imei, setImei] = useState('');
  const [isImeiValidFormat, setIsImeiValidFormat] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null);
  const [simType, setSimType] = useState<'eSIM' | 'Physical SIM'>('eSIM');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualDevice, setManualDevice] = useState({
    brand: '',
    model: '',
    esimCapable: 'unknown',
    lockStatus: 'unknown',
    currentCarrier: ''
  });

  const navigate = useNavigate();
  const device = compatResult?.device;
  const isManualReview = compatResult?.compatibility_status === 'needs_manual_review';
  const deviceName = device
    ? `${device.brand} ${device.model}`
    : [manualDevice.brand, manualDevice.model].filter(Boolean).join(' ') || 'Manual Review Device';
  const esimAllowed = device ? device.esim_capable !== false : manualDevice.esimCapable !== 'no';

  const handleVerifyDevice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isImeiValidFormat) {
      setErrorMsg('Please enter a valid 15-digit IMEI.');
      return;
    }

    setIsChecking(true);
    setErrorMsg('');

    try {
      const result = await compatibilityService.checkCompatibility(imei);
      if (!result.success || !result.imei_valid) {
        setErrorMsg(result.message || 'Please enter a valid 15-digit IMEI.');
        return;
      }

      setCompatResult(result);
      setSimType(result.device?.esim_capable === false ? 'Physical SIM' : 'eSIM');
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || "We couldn't reach the PacMac device lookup service. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSimSelectionSubmit = () => {
    if (!compatResult) return;

    addToCart({
      type: 'byop',
      name: `BYOP Line (${deviceName} - ${simType})`,
      price: 0
    });

    sessionStorage.setItem('pacmac_checkout_sim', simType);
    sessionStorage.setItem('pacmac_checkout_device', deviceName);
    sessionStorage.setItem('pacmac_checkout_imei_last4', imei.slice(-4));
    sessionStorage.setItem('pacmac_checkout_tac', compatResult.tac || imei.slice(0, 8));
    sessionStorage.setItem('pacmac_onboarding_device_result', JSON.stringify({
      imei_last4: imei.slice(-4),
      tac: compatResult.tac || imei.slice(0, 8),
      brand: device?.brand || manualDevice.brand || null,
      model: device?.model || manualDevice.model || null,
      compatibility_status: compatResult.compatibility_status,
      sim_type: simType,
      is_esim_capable: device?.esim_capable ?? (manualDevice.esimCapable === 'unknown' ? null : manualDevice.esimCapable === 'yes'),
      activation_readiness: isManualReview ? 'Manual review required' : 'Device identified',
      manual_review_required: isManualReview,
      lock_status: manualDevice.lockStatus,
      current_carrier: manualDevice.currentCarrier || null
    }));

    navigate('/checkout');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-16 sm:pb-24 font-sans font-light">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-xl mx-auto px-6 pt-24 sm:pt-32 md:pt-40">
        <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-white/5 pb-4 font-mono text-[8px] sm:text-[9px] text-brand-gray-500 uppercase tracking-widest select-none">
          <span>Device Identification</span>
          <span>Step {step} of 3</span>
        </div>

        <AnimatePresence mode="wait">
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
                  First, let's identify your phone.
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400">
                  PacMac checks your IMEI against a TAC device database before activation review.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setStep(2)}
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
                      Enter your IMEI so PacMac can identify the device model from its TAC. Final carrier activation rules are checked later.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-[11px] font-mono text-white/50 group-hover:text-white transition-colors">
                    Check my phone <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  onClick={() => navigate('/phones')}
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
                      Choose from PacMac-ready unlocked handsets and continue with a fresh line setup.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1 text-[11px] font-mono text-white/50 group-hover:text-white transition-colors">
                    Explore storefront <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

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
                  Check your phone by IMEI.
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400">
                  We use the first 8 digits, called the TAC, to identify the device. We store only the TAC and IMEI last four.
                </p>
              </div>

              <form onSubmit={handleVerifyDevice} className="space-y-6">
                <ImeiInput
                  value={imei}
                  disabled={isChecking}
                  onChange={(val, valid) => {
                    setImei(val);
                    setIsImeiValidFormat(valid);
                    if (errorMsg) setErrorMsg('');
                  }}
                />

                {errorMsg && (
                  <div className="border border-red-500/10 bg-red-950/20 text-red-300 p-4 rounded-lg text-xs leading-relaxed text-center font-mono select-none">
                    {errorMsg}
                  </div>
                )}

                {isChecking ? (
                  <div className="border border-white/5 bg-neutral-950/60 rounded-xl p-6 text-center py-10 space-y-4">
                    <RefreshCw className="w-6 h-6 text-white animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-white">Looking up device TAC...</p>
                      <p className="text-[10px] font-mono text-brand-gray-500">Checking PacMac's server-side device database</p>
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
                      Check My Phone
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          )}

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
                  Device Lookup
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray-400">
                  This identifies your phone. Carrier compatibility still requires PacMac activation rules before service goes live.
                </p>
              </div>

              <div className={`border rounded-xl p-5 ${
                isManualReview ? 'border-yellow-500/20 bg-yellow-950/5' : 'border-emerald-400/20 bg-emerald-400/5'
              }`}>
                <div className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isManualReview ? 'bg-yellow-500/10 text-yellow-300' : 'bg-emerald-400/10 text-emerald-300'
                  }`}>
                    {isManualReview ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
                      {isManualReview ? 'Manual Review Needed' : 'Device Identified'}
                    </h4>
                    <p className="text-[11px] font-mono text-brand-gray-400">
                      TAC {compatResult.tac || imei.slice(0, 8)} · IMEI last four ...{imei.slice(-4)}
                    </p>
                    <p className="text-sm text-white">
                      {device ? `${device.brand} ${device.model}` : "We couldn't match this TAC to a known device yet."}
                    </p>
                    <p className="text-xs text-brand-gray-300 font-light leading-relaxed">
                      {device
                        ? 'PacMac found this model in the TAC database. Final activation will still verify lock status, SIM profile, and carrier rules.'
                        : 'Your IMEI format is valid, but this phone needs manual review. Add what you know and PacMac will carry it into checkout.'}
                    </p>
                  </div>
                </div>
              </div>

              {isManualReview && (
                <div className="border border-white/8 bg-neutral-950/45 rounded-xl p-5 space-y-4">
                  <h3 className="font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest">Manual Device Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={manualDevice.brand}
                      onChange={(event) => setManualDevice((current) => ({ ...current, brand: event.target.value }))}
                      placeholder="Brand"
                      className="h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
                    />
                    <input
                      value={manualDevice.model}
                      onChange={(event) => setManualDevice((current) => ({ ...current, model: event.target.value }))}
                      placeholder="Model"
                      className="h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
                    />
                    <select
                      value={manualDevice.esimCapable}
                      onChange={(event) => {
                        setManualDevice((current) => ({ ...current, esimCapable: event.target.value }));
                        if (event.target.value === 'no') setSimType('Physical SIM');
                      }}
                      className="h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
                    >
                      <option value="unknown">eSIM support unknown</option>
                      <option value="yes">eSIM supported</option>
                      <option value="no">Physical SIM only</option>
                    </select>
                    <select
                      value={manualDevice.lockStatus}
                      onChange={(event) => setManualDevice((current) => ({ ...current, lockStatus: event.target.value }))}
                      className="h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
                    >
                      <option value="unknown">Lock status unknown</option>
                      <option value="unlocked">Unlocked</option>
                      <option value="locked">May be carrier locked</option>
                    </select>
                  </div>
                  <input
                    value={manualDevice.currentCarrier}
                    onChange={(event) => setManualDevice((current) => ({ ...current, currentCarrier: event.target.value }))}
                    placeholder="Current carrier, optional"
                    className="w-full h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-mono text-[10px] text-brand-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
                  Select SIM Delivery
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    disabled={!esimAllowed}
                    onClick={() => setSimType('eSIM')}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                      !esimAllowed
                        ? 'opacity-40 cursor-not-allowed border-white/5 bg-neutral-950/20'
                        : simType === 'eSIM'
                          ? 'bg-neutral-900 border-white text-white'
                          : 'bg-neutral-950/40 border-white/5 text-brand-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="max-w-[85%]">
                      <span className="text-xs font-semibold block">eSIM</span>
                      <span className="text-[10px] text-brand-gray-400 font-light mt-0.5 block leading-normal">
                        {esimAllowed ? 'Digital SIM profile for devices that support eSIM.' : 'This device is marked physical SIM only.'}
                      </span>
                    </div>
                    {simType === 'eSIM' && <Check className="w-4 h-4 text-white" />}
                  </button>

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
                      <span className="text-xs font-semibold block">Physical SIM</span>
                      <span className="text-[10px] text-brand-gray-400 font-light mt-0.5 block leading-normal">
                        Shipped SIM card for devices that use a tray-based SIM.
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, RefreshCw, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsVerifying(true);
    setErrorMsg('');
    
    const { success, error } = await authService.signInWithOtp(email);
    setIsVerifying(false);

    if (success) {
      setStep(2);
    } else {
      setErrorMsg(error || "Unable to dispatch magic link. Please check your format.");
    }
  };

  const handleCodeChange = (index: number, val: string) => {
    const cleanedVal = val.replace(/\D/g, '').slice(0, 1);
    const updated = [...code];
    updated[index] = cleanedVal;
    setCode(updated);

    // Auto-focus next field
    if (cleanedVal && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.join('');
    if (token.length < 4) {
      setErrorMsg("Please fill in all digits.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    const { session, error } = await authService.verifyOtp(email, token);
    setIsVerifying(false);

    if (session) {
      navigate('/dashboard');
    } else {
      setErrorMsg(error || "Invalid magic passcode. Please retry.");
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden font-sans font-light">
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm border border-white/5 bg-neutral-950/40 backdrop-blur-md rounded-xl p-8 shadow-xl"
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500 block">
                  Secure Access
                </span>
                <h2 className="font-display text-xl font-semibold text-white mt-1">
                  Access your dashboard
                </h2>
                <p className="text-xs text-brand-gray-400 font-light mt-1.5 leading-relaxed">
                  Enter your email. We'll dispatch a temporary magic passcode code. No passwords required.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="w-full bg-neutral-950 border border-white/10 rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-brand-gray-500 absolute left-4 top-3.5" />
                </div>

                {errorMsg && (
                  <p className="text-xs font-mono text-white bg-red-950/20 border border-red-500/10 p-3 rounded text-center">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching code...
                    </>
                  ) : (
                    <>
                      Request magic passcode <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest block">
                  DEMO TRITICAL: Enter `demo@pacmac.com` for preloaded line data.
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500 block">
                  Verification Code
                </span>
                <h2 className="font-display text-xl font-semibold text-white mt-1">
                  Enter verification token
                </h2>
                <p className="text-xs text-brand-gray-400 font-light mt-1.5 leading-relaxed">
                  We sent a code to <span className="font-mono text-white">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex justify-center gap-3">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          const prevInput = document.getElementById(`otp-${idx - 1}`);
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      className="w-12 h-14 bg-neutral-950 border border-white/10 rounded text-center text-xl font-mono focus:outline-none focus:border-white transition-all text-white"
                    />
                  ))}
                </div>

                {errorMsg && (
                  <p className="text-xs font-mono text-white bg-red-950/20 border border-red-500/10 p-3 rounded text-center">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 text-center text-xs font-mono border border-white/10 hover:border-white/20 rounded transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Confirm <Key className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

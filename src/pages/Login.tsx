import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: 6-digit OTP
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6-digit code
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const isBypassActive = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true' && !import.meta.env.PROD;

  // Translate technical Supabase / connection error strings into human terms
  const getFriendlyError = (rawError: string) => {
    const err = rawError.toLowerCase();
    if (err.includes('expired') || err.includes('token signature') || err.includes('invalid flow state')) {
      return 'Your sign-in link has expired. Please request a new one.';
    }
    if (err.includes('invalid') || err.includes('does not match') || err.includes('incorrect') || err.includes('bad code')) {
      return 'The passcode is incorrect. Please verify and try again.';
    }
    if (err.includes('network') || err.includes('fetch') || err.includes('connection')) {
      return 'We had trouble connecting to the network. Please check your connectivity and try again.';
    }
    return rawError;
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Parse redirect values and callback tokens on mount
  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(search || (hash.includes('?') ? hash.split('?')[1] : ''));
    
    // Pre-populate email parameter
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    async function handleAuthCallback() {
      let codeParam = searchParams.get('code');
      
      if (codeParam) {
        setIsVerifying(true);
        setErrorMsg('');
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(codeParam);
          if (data.session) {
            // Clean hash URL params
            window.history.replaceState(null, '', window.location.pathname + window.location.hash.split('?')[0]);
            navigate('/dashboard');
          } else if (error) {
            setErrorMsg(getFriendlyError(error.message));
          }
        } catch (err: any) {
          setErrorMsg(getFriendlyError(err.message || "Internal token exchange error."));
        } finally {
          setIsVerifying(false);
        }
      }
    }

    handleAuthCallback();
  }, [location, navigate]);

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
      setErrorMsg(getFriendlyError(error || "Unable to dispatch magic link. Please check your format."));
    }
  };

  const handleCodeChange = (index: number, val: string) => {
    const cleanedVal = val.replace(/\D/g, '').slice(0, 1);
    const updated = [...code];
    updated[index] = cleanedVal;
    setCode(updated);

    // Auto-focus next field
    if (cleanedVal && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.join('');
    if (token.length < 6 && !(isBypassActive && token.length === 4)) {
      setErrorMsg("Please fill in all 6 digits.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    const { session, error } = await authService.verifyOtp(email, token);
    setIsVerifying(false);

    if (session) {
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setErrorMsg(getFriendlyError(error || "Invalid magic passcode. Please retry."));
    }
  };

  // Developer Bypass Login handler
  const handleDevBypass = async () => {
    setIsVerifying(true);
    setErrorMsg('');
    
    const targetEmail = email || 'dev-tester@pacmac.com';
    const { session, error } = await authService.verifyOtp(targetEmail, '123456');
    
    setIsVerifying(false);
    if (session) {
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setErrorMsg(getFriendlyError(error || "Bypass failed."));
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden font-sans font-light">
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md border border-white/5 bg-neutral-950/40 backdrop-blur-md rounded-xl p-8 shadow-xl"
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
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gray-500 block">
                  Secure Access Portal
                </span>
                <h2 className="font-display text-xl font-semibold text-white mt-1">
                  Access your dashboard
                </h2>
                <p className="text-xs text-brand-gray-400 font-light mt-2 leading-relaxed">
                  Enter your email. We'll dispatch a secure magic passcode or link to your inbox. No passwords required.
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
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-all font-mono"
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
                  className="w-full py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Requesting token...
                    </>
                  ) : (
                    <>
                      Send Magic Link <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {isBypassActive && (
                <div className="border border-yellow-500/10 bg-yellow-950/5 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2 items-start text-yellow-400 text-xs font-mono">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-semibold block uppercase">Developer Mode Bypass</span>
                      <span className="text-[10px] text-brand-gray-500 mt-0.5 block leading-normal">
                        Bypass email delivery checks and sign in immediately with a local testing profile.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleDevBypass}
                    className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 font-mono text-[10px] rounded uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Bypass Authentication
                  </button>
                </div>
              )}

              <div className="text-center pt-2">
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest block">
                  Demo account: Enter `demo@pacmac.com` for preloaded line data.
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
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gray-500 block">
                  Verification Code
                </span>
                <h2 className="font-display text-xl font-semibold text-white mt-1">
                  Enter 6-digit token
                </h2>
                <p className="text-xs text-brand-gray-400 font-light mt-2 leading-relaxed">
                  We sent a code to <span className="font-mono text-white">{email}</span>. Click the link in the email or enter the code below.
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex justify-center gap-2">
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
                      className="w-10 h-12 bg-neutral-950 border border-white/10 rounded text-center text-lg font-mono focus:outline-none focus:border-white transition-all text-white"
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
                    className="flex-1 py-3 text-center text-xs font-mono border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Confirm Code <Key className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {isBypassActive && (
                <button
                  onClick={handleDevBypass}
                  className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 font-mono text-[10px] rounded uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Bypass Code Verification
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

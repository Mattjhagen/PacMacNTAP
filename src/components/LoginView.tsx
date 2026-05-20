import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { KeyRound, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginView() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState<string>('555-019-4820');
  const [passcode, setPasscode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [smsSent, setSmsSent] = useState<boolean>(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSmsSent(true);
    }, 1000);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden flex items-center justify-center">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Cyber lights */}
      <div className="absolute right-1/4 top-1/4 w-[400px] h-[300px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md text-left space-y-6 relative z-10">
        
        <div className="space-y-2">
          <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
            SECURE CARRIER LOGON // CONSOLE ACCESS
          </span>
          <h3 className="font-display text-2xl font-bold text-white">
            Access your telemetry.
          </h3>
          <p className="text-xs text-brand-gray-450 font-sans font-light">
            {!smsSent 
              ? 'Enter your mobile number to authorize account control panels.' 
              : 'A 4-digit token has been simulated to your number. Enter it below.'}
          </p>
        </div>

        {!smsSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Mobile Line Number</label>
              <input
                type="text"
                required
                placeholder="555-019-4820"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-center text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Dispatch SMS Token
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Verification Token</label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 tracking-widest text-center focus:border-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-center text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Authorize Terminal Access
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setSmsSent(false)}
              className="w-full text-center font-mono text-[9px] text-brand-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              ← Edit Phone Number
            </button>
          </form>
        )}

      </div>
    </section>
  );
}

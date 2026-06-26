import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Radio, Shield, HelpCircle, ArrowRight, Smartphone, Lock, Info, Send, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');
  const [waitlistNum, setWaitlistNum] = useState(0);
  const [waitlistError, setWaitlistError] = useState('');

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setIsSubmitting(true);
    setWaitlistError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: waitlistEmail.split('@')[0],
          email: waitlistEmail
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to join waitlist.');
      setWaitlistNum(data.waitlistNumber);
      setSubmitStatus('success');
      setWaitlistEmail('');
    } catch (err: any) {
      setWaitlistError(err.message || 'Unable to join waitlist.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 100 }
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24">
      {/* Background glow and subtle grid */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-25 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 md:pt-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Status Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-300">
              PREPAID WIRELESS, REBUILT FROM THE CELL UP
            </span>
          </motion.div>

          {/* Main Slogan */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.1] max-w-4xl text-white"
          >
            Honestly, we just wanted <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-brand-gray-100 to-brand-gray-400 text-glow-sm">
              telecom to feel less miserable.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 md:mt-8 text-base md:text-lg text-brand-gray-400 max-w-2xl leading-relaxed font-sans font-light"
          >
            No fluorescent carrier store energy. No picking data tiers. No overpaying just in case. Just cellular service that adjusts to your actual usage, backed by an AI that blocks scam calls before your phone vibrates.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/plans"
              className="group relative w-full sm:w-52 py-3 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
            >
              See How It Bills
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/phones"
              className="w-full sm:w-52 py-3 text-center text-sm font-mono tracking-tight text-white border border-white/10 hover:border-white/20 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Devices</span>
            </Link>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-5 text-[11px] font-mono text-brand-gray-500"
          >
            Activation takes about 3 minutes via eSIM.
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-28 md:mt-36 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: Adaptive Billing */}
          <motion.div
            variants={itemVariants}
            className="group relative p-8 rounded-xl border border-white/5 bg-neutral-950/40 backdrop-blur-sm overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white mb-2">Adaptive AI Billing</h3>
              <p className="text-sm text-brand-gray-400 leading-relaxed font-light mb-6">
                Traditional carriers make you guess your monthly plan. We don't. Your rate scales dynamically between $12 and $30 based on what you actually consume. Keep your wallet.
              </p>
            </div>
            <Link
              to="/plans"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors"
            >
              How it works <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card 2: PackieAI Spam Protection */}
          <motion.div
            variants={itemVariants}
            className="group relative p-8 rounded-xl border border-white/5 bg-neutral-950/40 backdrop-blur-sm overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white mb-2">PackieAI Screening</h3>
              <p className="text-sm text-brand-gray-400 leading-relaxed font-light mb-6">
                An on-device virtual assistant that answers unknown numbers, quizzes scammers for official IDs, transcripts dialogue in real time, and hangs up on robocalls.
              </p>
            </div>
            <Link
              to="/packieai"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors"
            >
              See interactive demo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card 3: Support Assistant */}
          <motion.div
            variants={itemVariants}
            className="group relative p-8 rounded-xl border border-white/5 bg-neutral-950/40 backdrop-blur-sm overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mb-6">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white mb-2">Intelligent Diagnostics</h3>
              <p className="text-sm text-brand-gray-400 leading-relaxed font-light mb-6">
                Need to refresh connection signals, explain an odd invoice charge, or configure eSIM cellular settings? Our calm assistant diagnoses and fixes line states in real time.
              </p>
            </div>
            <Link
              to="/support"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors"
            >
              Open helper chat <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Dynamic quote block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 md:mt-32 p-8 border border-white/5 rounded-xl bg-neutral-950/20 text-center max-w-3xl mx-auto"
        >
          <p className="text-base md:text-lg italic font-light text-brand-gray-300">
            "Your current carrier profits when you overestimate your plan. Your phone bill should behave more like Spotify and less like cable TV."
          </p>
          <span className="block mt-4 text-[10px] font-mono tracking-widest text-brand-gray-500 uppercase">
            — THE PACMAC PROTOCOL
          </span>
        </motion.div>

        {/* Waitlist & Interest Capture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-28 md:mt-36 max-w-2xl mx-auto border border-white/10 bg-neutral-950/40 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6"
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-medium bg-white/10 text-white uppercase tracking-wider">
              Closed Beta
            </span>
            <h2 className="font-display text-2xl font-semibold text-white tracking-tight pt-2">
              Request Early Access
            </h2>
            <p className="text-xs sm:text-sm text-brand-gray-400 font-light max-w-lg mx-auto leading-relaxed">
              We are onboarding users in controlled weekly batches. Join the queue to secure your line and receive a $10 initial activation credit when we launch.
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="p-6 rounded-lg bg-white/5 border border-white/10 max-w-md mx-auto space-y-2">
              <span className="text-sm font-semibold text-white block">You're on the list.</span>
              <p className="text-xs text-brand-gray-400 font-light">
                Your queue number is <strong className="text-white">#{waitlistNum}</strong>. We'll dispatch your private invitation link via email as slots open.
              </p>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 text-xs font-mono bg-white text-black hover:bg-neutral-200 transition-all rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    Request Access
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              {waitlistError && (
                <p className="sm:col-span-2 text-xs text-red-200 border border-red-300/20 bg-red-300/10 rounded px-3 py-2">
                  {waitlistError}
                </p>
              )}
            </form>
          )}
        </motion.div>

        {/* Public Trust Layer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/5 text-center text-xs font-light"
        >
          <div className="space-y-1">
            <div className="flex justify-center mb-2">
              <Lock className="w-4 h-4 text-brand-gray-400" />
            </div>
            <h4 className="font-semibold text-white text-[11px] font-mono uppercase tracking-wider">End-to-End Privacy</h4>
            <p className="text-brand-gray-500 text-[10px] leading-relaxed">
              We never track, store, or resell your cellular location logs or raw telemetry metadata.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-center mb-2">
              <Info className="w-4 h-4 text-brand-gray-400" />
            </div>
            <h4 className="font-semibold text-white text-[11px] font-mono uppercase tracking-wider">Transparent Billing</h4>
            <p className="text-brand-gray-500 text-[10px] leading-relaxed">
              Zero contract obligations. We authorized today, but only charge when your handset active registers.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-center mb-2">
              <Shield className="w-4 h-4 text-brand-gray-400" />
            </div>
            <h4 className="font-semibold text-white text-[11px] font-mono uppercase tracking-wider">Encrypted Screenings</h4>
            <p className="text-brand-gray-500 text-[10px] leading-relaxed">
              All PackieAI scam transcripts are encrypted client-side, keeping your records strictly personal.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

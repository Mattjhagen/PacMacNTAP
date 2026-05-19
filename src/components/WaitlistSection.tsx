import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Send, AlertCircle } from 'lucide-react';

export default function WaitlistSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [waitlistNumber, setWaitlistNumber] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);

    // Simulate network submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      // Generate a realistic high-end community number
      setWaitlistNumber(Math.floor(Math.random() * 500) + 1200);
    }, 1500);
  };

  return (
    <section id="waitlist" className="relative py-24 md:py-36 px-6 md:px-12 bg-black overflow-hidden">
      {/* Decorative ambient glowing grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[30vh] radial-glow-gradient pointer-events-none opacity-40 z-0" />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="flex flex-col items-center">
          
          {/* Subtle Tag badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-400">
              COMMUNITY WAITLIST NOW OPEN
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Embrace Simplified Wireless
          </h2>
          <p className="text-sm md:text-base text-brand-gray-400 font-light max-w-lg leading-relaxed mb-12">
            Secure your spot in our upcoming local connectivity pilots. Keep wireless service human-first, responsive, and completely transparent.
          </p>

          <div className="w-full max-w-md border border-white/10 rounded-2xl bg-black/60 backdrop-blur-md p-6 md:p-8 glow-md">
            <AnimatePresence mode="wait">
              {!isCompleted ? (
                <motion.form
                  key="waitlist-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5 text-left"
                >
                  <div>
                    <label htmlFor="fullname" className="block text-xs font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      id="fullname"
                      type="text"
                      required
                      placeholder="e.g. Liam Sterling"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="emailaddress" className="block text-xs font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      id="emailaddress"
                      type="email"
                      required
                      placeholder="e.g. lsterling@network.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name || !email}
                    className="w-full mt-2 bg-white hover:bg-brand-gray-200 text-black py-3.5 rounded-xl text-sm font-semibold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] disabled:opacity-55"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-start gap-2 text-[11px] text-brand-gray-500 leading-normal pt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-brand-gray-600 mt-0.5" />
                    <span>No data tracking. We only use your email to schedule beta access and update local node availability.</span>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="py-10 text-center"
                >
                  <div className="w-14 h-14 bg-white/5 border border-white/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-white tracking-tight mb-2">
                    Confirmation Secured
                  </h4>
                  <p className="text-xs text-brand-gray-400 max-w-xs mx-auto leading-relaxed mb-6">
                    Welcome to the core network, <span className="text-white font-medium">{name}</span>. You've successfully reserved connection slot priority.
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-xl py-4 px-6 inline-block mb-6">
                    <span className="font-mono text-[10px] text-brand-gray-500 block uppercase tracking-wider">
                      Your Queue Spot
                    </span>
                    <span className="font-display text-2xl font-bold text-white tracking-tight block mt-0.5">
                      #{waitlistNumber}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-gray-500 max-w-xs mx-auto">
                    We will ping you at <span className="text-brand-gray-300">{email}</span> as soon as your local grid cell activation initiates. Let’s keep wireless human.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}

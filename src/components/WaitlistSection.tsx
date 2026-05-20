import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Send, ShieldAlert } from 'lucide-react';

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
      // Generate a realistic queue spot
      setWaitlistNumber(Math.floor(Math.random() * 450) + 2180);
    }, 1400);
  };

  return (
    <section id="waitlist" className="relative py-24 md:py-36 px-6 md:px-12 bg-black overflow-hidden">
      {/* Decorative ambient glowing lines and radial grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[35vh] radial-glow-gradient pointer-events-none opacity-40 z-0" />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="flex flex-col items-center">
          
          {/* Subtle Tag badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-400">
              10 // EARLY ACCESS
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Want early access?
          </h2>
          <p className="text-sm md:text-base text-brand-gray-400 font-light max-w-lg leading-relaxed mb-12 font-sans">
            We’re launching PacMac Mobile soon, along with smart built-in features like PackieAI. Join the list to reserve your spot.
          </p>

          {/* Glassmorphism signup Card */}
          <div className="w-full max-w-md border border-white/10 rounded-2xl bg-black/60 p-6 md:p-8 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all glow-md">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
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
                      Your Name *
                    </label>
                    <input
                      id="fullname"
                      type="text"
                      required
                      placeholder="e.g. Liam Sterling"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-brand-gray-600"
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
                      placeholder="e.g. lsterling@domain.net"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-brand-gray-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name || !email}
                    className="w-full mt-2 bg-white hover:bg-brand-gray-200 text-black py-4 rounded-xl text-sm font-semibold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] disabled:opacity-55"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Request Invite</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-start gap-2.5 text-[10px] font-mono text-brand-gray-500 leading-normal pt-1">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 text-brand-gray-600 mt-0.5" />
                    <span>SAFE AND COMPLIANT: We never share or sell your email address. You will only receive updates regarding PackieAI and PacMac Mobile.</span>
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
                  <h4 className="font-display text-2xl font-bold text-white tracking-tight mb-2">
                    You’re on the list.
                  </h4>
                  <p className="text-sm text-brand-gray-400 max-w-xs mx-auto leading-relaxed mb-6 font-sans">
                    Thanks for signing up, <span className="text-white font-medium">{name}</span>! We’ve reserved your spot and will let you know when it’s ready.
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-xl py-4.5 px-6 inline-block mb-6 relative">
                    <span className="font-mono text-[9px] text-brand-gray-500 block uppercase tracking-wider">
                      Your Waitlist Spot
                    </span>
                    <span className="font-display text-2xl font-bold text-white tracking-tight block mt-0.5">
                      #{waitlistNumber}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-brand-gray-500 max-w-xs mx-auto">
                    We will send updates directly to <span className="text-brand-gray-300">{email}</span> as we launch. Let's block the spam together.
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

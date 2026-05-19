import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronRight, Volume2, Shield, Eye, Database } from 'lucide-react';

export default function HeroSection() {
  const [textIndex, setTextIndex] = useState(0);
  const rotatingPhrases = [
    'Screening suspicious calls…',
    'Wasting scammer time…',
    'Protecting your number…',
    'Learning new threats…'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 100,
      },
    },
  };

  // Generate 26 bars for the audio reactive visualizer
  const waveBarsCount = 28;

  return (
    <section className="relative min-h-[95vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 px-6 md:px-12 bg-black">
      {/* Cinematic grid background and glow */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[65vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 z-0 animate-grid-drift" />

      {/* Depth light effect / horizontal separator gradient */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Coming Soon status badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 ring-1 ring-white/5"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-300">
              COMING SOON
            </span>
          </motion.div>

          {/* Majestic Hero Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight leading-[1.05] text-white"
          >
            Your AI Shield <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-brand-gray-550 text-glow-sm">
              Against Scammers.
            </span>
          </motion.h1>

          {/* Subheadline description */}
          <motion.p
            variants={itemVariants}
            className="mt-6 md:mt-8 text-base md:text-xl text-brand-gray-300 max-w-2xl leading-relaxed font-sans font-light"
          >
            PackieAI answers the calls you shouldn’t have to. Protect your focus, preserve your privacy, and silence fraudulent robocallers forever.
          </motion.p>

          {/* Typewriter Rotating Slogan */}
          <motion.div
            variants={itemVariants}
            className="mt-4 min-h-[32px] flex items-center justify-center text-xs md:text-sm font-mono text-brand-gray-400 tracking-wider"
          >
            <ShieldCheck className="w-4 h-4 text-white/50 mr-2 animate-pulse" />
            <AnimatePresence mode="wait">
              <motion.span
                key={textIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="text-white font-light"
              >
                {rotatingPhrases[textIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* AI Audio Waveform Visualizer container */}
          <motion.div
            variants={itemVariants}
            className="mt-10 md:mt-12 w-full max-w-sm border border-white/10 rounded-2xl bg-black/60 p-4 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-white/20 transition-all glow-sm"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 font-mono text-[10px] text-brand-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>INTERCEPTING SIGNAL</span>
              </div>
              <span className="text-white/60">PACKIE_VOICE_CORE</span>
            </div>

            {/* Glowing wave segments */}
            <div className="h-14 flex items-center justify-between px-2 pt-2 relative">
              {Array.from({ length: waveBarsCount }).map((_, i) => {
                // Generate a random duration to make it look live and asynchronous
                const duration = 0.5 + Math.random() * 0.9;
                return (
                  <motion.div
                    key={i}
                    animate={{
                      height: [
                        `${15 + Math.random() * 25}%`,
                        `${60 + Math.random() * 40}%`,
                        `${15 + Math.random() * 20}%`
                      ]
                    }}
                    transition={{
                      duration,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="w-1.5 bg-gradient-to-t from-white/10 via-white/80 to-white/10 rounded-full"
                    style={{
                      opacity: 0.25 + (i % 3) * 0.25 // Fade nicely towards edges
                    }}
                  />
                );
              })}
            </div>

            <div className="text-[10px] font-mono text-brand-gray-500 flex justify-between pt-1">
              <span>0.00 kHz</span>
              <span className="text-white/40">AI DESTRUCTION ACTIVE</span>
              <span>12.4 kHz</span>
            </div>
          </motion.div>

          {/* Main Hero Call-to-Actions */}
          <motion.div
            variants={itemVariants}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-10"
          >
            <button
              onClick={() => handleScrollTo('#waitlist')}
              className="group relative w-full sm:w-56 py-3.5 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.30)] flex items-center justify-center gap-2 cursor-pointer"
            >
              Join Early Access
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => handleScrollTo('#how-it-works')}
              className="w-full sm:w-56 py-3.5 text-center text-sm font-mono tracking-tight text-white border border-white/10 hover:border-white/40 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>See How It Works</span>
            </button>
          </motion.div>

          {/* Slogan metadata bottom bar */}
          <motion.div
            variants={itemVariants}
            className="mt-16 md:mt-20 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16 border-t border-white/5 pt-8 w-full max-w-3xl text-left"
          >
            <div>
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Defensive Shield
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Active Call Persona
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Intelligence Speed
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1">
                Real-Time Voice LLM
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Network Native
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1">
                Zero App Download Required
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

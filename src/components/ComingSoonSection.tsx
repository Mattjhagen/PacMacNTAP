import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Wifi, Sparkles, AlertTriangle } from 'lucide-react';

export default function ComingSoonSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 48,
    hours: 12,
    minutes: 44,
    seconds: 59,
  });

  useEffect(() => {
    // Generate a fixed launch target countdown, say 48 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 48);
    targetDate.setHours(targetDate.getHours() + 12);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 95,
      },
    },
  };

  return (
    <section id="coming-soon" className="relative py-24 md:py-36 px-6 md:px-12 bg-black overflow-hidden border-b border-white/5">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="space-y-12"
        >
          {/* Subtle hacker philosophy category */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-brand-gray-800" />
            <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
              04 // LAUNCH CHRONOLOGY
            </span>
            <div className="h-[1px] w-8 bg-brand-gray-800" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl font-medium tracking-tight text-white leading-none"
          >
            Something smarter is coming.
          </motion.h2>

          {/* Core concept paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-brand-gray-450 font-sans font-light leading-relaxed max-w-2xl mx-auto"
          >
            We’re building a better way to deal with spam calls, robocalls, and scammers — without making your phone experience complicated.
          </motion.p>

          {/* Countdown Clock Panel */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-6"
          >
            {/* Days block */}
            <div className="border border-white/10 rounded-2xl bg-white/[0.01] p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mt-2">
                Days Until Beta
              </span>
            </div>

            {/* Hours block */}
            <div className="border border-white/10 rounded-2xl bg-white/[0.01] p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mt-2">
                Hours
              </span>
            </div>

            {/* Minutes block */}
            <div className="border border-white/10 rounded-2xl bg-white/[0.01] p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mt-2">
                Minutes
              </span>
            </div>

            {/* Seconds block */}
            <div className="border border-white/10 rounded-2xl bg-white/[0.01] p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-brand-gray-400 mt-2">
                Seconds
              </span>
            </div>
          </motion.div>

          {/* Minimal security indicators / telemetry footer */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-[10px] font-mono text-brand-gray-500 pt-6 border-t border-white/5"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white/40" />
              INTEGRATED SPAM FILTERS
            </span>
            <span className="hidden md:inline text-white/10">|</span>
            <span className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white/40" />
              WORKS DIRECTLY ON YOUR CELL NETWORK
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

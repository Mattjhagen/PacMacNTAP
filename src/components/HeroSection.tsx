import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowDown, ChevronRight, Radio } from 'lucide-react';

interface HeroSectionProps {
  onOpenPartner: () => void;
}

export default function HeroSection({ onOpenPartner }: HeroSectionProps) {
  const handleScrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#waitlist');
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
        staggerChildren: 0.15,
        delayChildren: 0.2,
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

  return (
    <section className="relative min-h-[96vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-6 md:px-12 bg-black">
      {/* Decorative radial gradients - soft ambient glow behind the hero */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-60 z-0 animate-grid-drift" />

      {/* Decorative glowing lines on border edges */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Subtle Tag badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:border-white/20 transition-all duration-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-white/80 animate-pulse" />
            <span className="text-[10px] md:text-sm uppercase font-mono tracking-widest text-brand-gray-300">
              Introducing PacMac Mobile
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight leading-[1.05] text-white"
          >
            Modern Wireless. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-brand-gray-500 text-glow-sm">
              Human Connection.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mt-6 md:mt-8 text-base md:text-xl text-brand-gray-400 max-w-2xl leading-relaxed font-sans font-light"
          >
            Affordable connectivity, premium experience, community-first support. We're rebuilding standard mobile delivery from the local level up.
          </motion.p>

          {/* Buttons CTA Container */}
          <motion.div
            variants={itemVariants}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <a
              href="#waitlist"
              onClick={handleScrollToWaitlist}
              className="group relative w-full sm:w-52 py-3.5 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.30)] flex items-center justify-center gap-2 cursor-pointer"
            >
              Coming Soon
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <button
              onClick={onOpenPartner}
              className="w-full sm:w-52 py-3.5 text-center text-sm font-mono tracking-tight text-white border border-white/10 hover:border-white/40 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Partner With Us</span>
            </button>
          </motion.div>

          {/* Slogan metadata bottom bar */}
          <motion.div
            variants={itemVariants}
            className="mt-16 md:mt-24 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16 border-t border-white/5 pt-8 w-full max-w-3xl text-left"
          >
            <div>
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Availability
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Beta Launch Q4 2026
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Core Objective
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1">
                Underserved Access
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Support Model
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1">
                100% Real Humans
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll helper */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-brand-gray-500 hover:text-white transition-colors"
          >
            <ArrowDown className="w-4 h-4 cursor-pointer" onClick={handleScrollToWaitlist} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

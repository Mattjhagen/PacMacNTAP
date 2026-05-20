import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const HEADLINES = [
  {
    top: "Modern mobile service",
    bottom: "built for real people."
  },
  {
    top: "Honest cell service",
    bottom: "minus the big carrier tax."
  },
  {
    top: "Premium wireless",
    bottom: "without the premium price."
  },
  {
    top: "Finally, a phone service",
    bottom: "that actually gets you."
  },
  {
    top: "Smarter connectivity",
    bottom: "for the whole community."
  }
];

export default function HeroSection() {
  const [headline] = useState(() => HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);

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
              INTRODUCING PACMAC WIRELESS
            </span>
          </motion.div>

          {/* Majestic Hero Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight leading-[1.05] text-white"
          >
            {headline.top} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-brand-gray-500 text-glow-sm">
              {headline.bottom}
            </span>
          </motion.h1>

          {/* Subheadline description */}
          <motion.p
            variants={itemVariants}
            className="mt-6 md:mt-8 text-base md:text-xl text-brand-gray-300 max-w-2xl leading-relaxed font-sans font-light"
          >
            PacMac Mobile combines affordable connectivity, modern technology, and community-first support into a simpler wireless experience.
          </motion.p>

          {/* Main Hero Call-to-Actions */}
          <motion.div
            variants={itemVariants}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-10"
          >
            <button
              onClick={() => handleScrollTo('#coming-soon')}
              className="group relative w-full sm:w-56 py-3.5 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.30)] flex items-center justify-center gap-2 cursor-pointer"
            >
              Coming Soon
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => handleScrollTo('#pacmac-features')}
              className="w-full sm:w-56 py-3.5 text-center text-sm font-mono tracking-tight text-white border border-white/10 hover:border-white/40 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Features</span>
            </button>
          </motion.div>

          {/* Small supporting text */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-xs font-mono text-brand-gray-400 tracking-wider"
          >
            Including PackieAI spam call protection.
          </motion.p>

          {/* Slogan metadata bottom bar */}
          <motion.div
            variants={itemVariants}
            className="mt-16 md:mt-20 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16 border-t border-white/5 pt-8 w-full max-w-3xl text-left"
          >
            <div>
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Our Mission
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Connectivity for Everyone
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Smart & Clean
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1">
                Built-in Spam Protection
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-mono text-[10px] uppercase text-brand-gray-500 tracking-wider">
                Support First
              </div>
              <div className="text-xs md:text-sm font-light text-brand-gray-300 mt-1">
                Approachable, Human Help
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

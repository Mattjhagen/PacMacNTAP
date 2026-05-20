import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react';

interface PacMacItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

export default function WhatIsPacMac() {
  const items: PacMacItem[] = [
    {
      id: 'affordable-wireless',
      category: 'CONNECTIVITY',
      title: 'Affordable Wireless',
      description: 'Simple mobile plans focused on accessibility and everyday reliability.',
      icon: <Smartphone className="w-5 h-5 text-white" />,
    },
    {
      id: 'community-connectivity',
      category: 'ACCESSIBILITY',
      title: 'Community Connectivity',
      description: 'Programs designed to help more people stay connected.',
      icon: <HeartHandshake className="w-5 h-5 text-white" />,
    },
    {
      id: 'smart-features',
      category: 'INTELLIGENCE',
      title: 'Smart Mobile Features',
      description: 'Modern tools like PackieAI help reduce spam calls and improve privacy.',
      icon: <Sparkles className="w-5 h-5 text-white" />,
    },
  ];

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 90,
      },
    },
  };

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

  return (
    <section id="pacmac-features" className="relative py-24 md:py-32 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders to match other sections */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      
      {/* Radial soft glow */}
      <div className="absolute left-1/2 -translate-x-1/2 top-10 w-[500px] h-[350px] bg-white/[0.012] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-brand-gray-800" />
            <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
              01 // MISSION MATRIX
            </span>
            <div className="h-[1px] w-8 bg-brand-gray-800" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white">
            What PacMac Mobile Is Building
          </h2>
          <p className="text-sm md:text-base text-brand-gray-400 font-light leading-relaxed">
            A modern wireless company focused on clear value, approachable support, and smart integrated utilities.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="group rounded-2xl border border-white/10 bg-white/[0.01] p-6 md:p-8 backdrop-blur-md flex flex-col justify-between hover:border-white/25 hover:bg-white/[0.02] transition-all duration-300 relative glow-sm"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white">
                    {item.icon}
                  </div>
                  <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest">
                    {item.category}
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-white group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-brand-gray-400 font-sans font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {item.id === 'smart-features' ? (
                <button
                  onClick={() => handleScrollTo('#how-it-works')}
                  className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-brand-gray-405 group-hover:text-white text-left cursor-pointer w-full bg-transparent"
                >
                  <span className="flex items-center gap-1">
                    EXPLORE PACKIEAI FEATURE
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-brand-gray-500">
                  <span>PACMAC SERVICE LAYER</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/35" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

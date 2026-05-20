import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Shield, Radio } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Phones', href: '#phones' },
    { label: 'BYOP', href: '#byop' },
    { label: 'Plans', href: '#adaptive-plans' },
    { label: 'eSIM', href: '#esim' },
    { label: 'AI Billing', href: '#portal' },
    { label: 'PackieAI', href: '#how-it-works' },
    { label: 'Support', href: '#waitlist' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-black/85 backdrop-blur-md border-white/10 py-4'
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo with pulsing signal orb */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-white group"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-white/20 bg-white/5 transition-all group-hover:border-white/50 overflow-hidden">
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span>
              PacMac<span className="font-light text-brand-gray-300"> Mobile</span>
            </span>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="text-sm font-medium tracking-tight text-brand-gray-400 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#waitlist"
              onClick={(e) => handleLinkClick(e, '#waitlist')}
              className="px-5 py-2 text-sm font-semibold tracking-tight text-black bg-white hover:bg-brand-gray-150 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-brand-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] bottom-0 z-35 bg-black border-t border-white/10 md:hidden flex flex-col p-6 space-y-6"
          >
            <div className="flex flex-col space-y-4 pt-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="text-lg font-medium text-brand-gray-300 hover:text-white transition-colors border-b border-white/5 pb-2"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-auto pb-12">
              <a
                href="#waitlist"
                onClick={(e) => handleLinkClick(e, '#waitlist')}
                className="w-full text-center py-3.5 text-base font-semibold text-black bg-white rounded-xl shadow-lg"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

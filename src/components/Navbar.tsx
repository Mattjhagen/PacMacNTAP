import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Shield, Radio, Terminal } from 'lucide-react';

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
    { label: 'Phones', to: '/phones' },
    { label: 'BYOP', to: '/byop' },
    { label: 'Plans', to: '/plans' },
    { label: 'eSIM', to: '/esim' },
    { label: 'AI Billing', to: '/ai-billing' },
    { label: 'PackieAI', to: '/packieai' },
    { label: 'Support AI', to: '/support' },
    { label: 'Login', to: '/login' },
    { label: 'Dashboard', to: '/dashboard' },
  ];

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
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-white group"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-white/20 bg-white/5 transition-all group-hover:border-white/50 overflow-hidden">
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span>
              PacMac<span className="font-light text-brand-gray-300"> Mobile</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `text-xs font-mono tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-brand-gray-450 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="w-1 h-1 rounded-full bg-white animate-ping" />}
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3 font-mono">


            <Link
              to="/byop"
              className="px-4 py-1.5 text-xs font-semibold tracking-tight text-black bg-white hover:bg-brand-gray-150 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.08)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden p-2 text-brand-gray-300 hover:text-white transition-colors cursor-pointer"
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
            className="fixed inset-x-0 top-[72px] bottom-0 z-35 bg-black border-t border-white/10 xl:hidden flex flex-col p-6 space-y-6"
          >
            <div className="flex flex-col space-y-4 pt-4 text-left">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-mono text-brand-gray-300 hover:text-white transition-colors border-b border-white/5 pb-2 block"
                >
                  {item.label}
                </Link>
              ))}

            </div>

            <div className="flex flex-col gap-4 mt-auto pb-12">
              <Link
                to="/byop"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3.5 text-base font-semibold text-black bg-white rounded-xl shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

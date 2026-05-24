import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Radio } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Plans', to: '/plans' },
    { label: 'Devices', to: '/phones' },
    { label: 'PackieAI', to: '/packieai' },
    { label: 'AI Billing', to: '/ai-billing' },
    { label: 'Support', to: '/support' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${
          scrolled || isOpen
            ? 'bg-black/90 backdrop-blur-md border-white/10 py-4'
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
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                  location.pathname === item.to
                    ? 'text-white font-medium'
                    : 'text-brand-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action button */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-7 bg-neutral-900 border border-white/5 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3.5">
                <span className="text-[10px] font-mono text-brand-gray-400 border-r border-white/5 pr-3.5 tracking-tight uppercase">
                  {user.name || user.email?.split('@')[0]}
                </span>
                <Link
                  to="/dashboard"
                  className="px-3.5 py-1.5 text-xs font-mono border border-white/10 hover:border-white/20 rounded hover:bg-white/5 text-white transition-colors"
                >
                  DASHBOARD
                </Link>
                <button
                  onClick={signOut}
                  className="px-3.5 py-1.5 text-xs font-mono border border-transparent text-brand-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4.5 py-1.5 text-xs font-mono font-semibold tracking-tight text-black bg-white hover:bg-brand-gray-200 rounded transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-1.5"
              >
                SIGN IN
              </Link>
            )}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-[72px] bottom-0 z-30 bg-black/95 backdrop-blur-md md:hidden flex flex-col p-6 space-y-6"
          >
            <div className="flex flex-col space-y-4 pt-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-semibold tracking-tight transition-colors border-b border-white/5 pb-2 ${
                    location.pathname === item.to ? 'text-white' : 'text-brand-gray-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-auto pb-12">
              {loading ? (
                <div className="w-full h-12 bg-neutral-900 border border-white/5 rounded animate-pulse" />
              ) : user ? (
                <>
                  <div className="text-center text-xs font-mono text-brand-gray-500 mb-1">
                    Member: {user.name || user.email}
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-3 text-sm font-semibold text-black bg-white rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="w-full text-center py-3 text-sm font-semibold text-brand-gray-400 border border-white/10 rounded-lg cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold text-black bg-white rounded-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

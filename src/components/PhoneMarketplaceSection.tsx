import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShoppingBag, Eye, Info, Smartphone, Sparkles, ArrowRight } from 'lucide-react';

interface PhoneDevice {
  id: string;
  name: string;
  tagline: string;
  description: string;
  retailPrice: number;
  financePrice: number;
  specs: string[];
  colors: { name: string; hex: string }[];
  imageDesc: string;
}

export default function PhoneMarketplaceSection() {
  const navigate = useNavigate();
  const [financeMode, setFinanceMode] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<Record<string, string>>({
    'pro-ultra': 'Matte Carbon',
    'light': 'Midnight Black',
    'zero': 'Graphite E-Ink'
  });
  const [addedPhone, setAddedPhone] = useState<string | null>(null);

  const devices: PhoneDevice[] = [
    {
      id: 'pro-ultra',
      name: 'PacMac Pro Ultra',
      tagline: 'Tiny supercomputer with commitment issues.',
      description: 'Absurdly powerful. Encased in high-grade titanium to survive drops, coffee spills, and general keyboard warrior usage. Features a screen brighter than your future.',
      retailPrice: 599,
      financePrice: 24,
      specs: ['6.8” OLED 120Hz Super Display', 'Titanium Frame', 'Pre-configured Dual eSIMs', '256GB High-Speed Storage'],
      colors: [
        { name: 'Matte Carbon', hex: '#1C1C1E' },
        { name: 'Titanium Grey', hex: '#8E8E93' },
        { name: 'Polar Silver', hex: '#E5E5EA' }
      ],
      imageDesc: 'Titanium phone profile'
    },
    {
      id: 'light',
      name: 'PacMac Light',
      tagline: 'Pocket-sized dopamine rectangle.',
      description: 'A beautifully balanced smartphone. Sleek, fast, and does exactly what you need without taxing your sanity or your wallet. Zero carrier bloatware included.',
      retailPrice: 299,
      financePrice: 12,
      specs: ['6.1” Liquid Retina OLED', 'Recycled Aluminum Shell', '5G Sub-6 / eSIM Ready', '128GB Internal Storage'],
      colors: [
        { name: 'Midnight Black', hex: '#121212' },
        { name: 'Aluminum Grey', hex: '#D1D1D6' }
      ],
      imageDesc: 'Aluminum phone profile'
    },
    {
      id: 'zero',
      name: 'PacMac Zero',
      tagline: 'Now with fewer carrier side quests.',
      description: 'The ultimate anti-distraction pocket companion. Features an E-Ink matte screen that keeps you off social media doomloops and keeps your battery charged for weeks.',
      retailPrice: 199,
      financePrice: 8,
      specs: ['5.4” Matte Clear E-Ink Screen', '3-Week Smart Standby Battery', '5G Sync Protocol', '64GB Minimal Storage'],
      colors: [
        { name: 'Graphite E-Ink', hex: '#2C2C2E' },
        { name: 'Slate Grey', hex: '#636366' }
      ],
      imageDesc: 'E-Ink phone profile'
    }
  ];

  const handleSelectDevice = (dev: PhoneDevice) => {
    setAddedPhone(dev.name);
    setTimeout(() => {
      setAddedPhone(null);
      // Navigate to checkout with item parameter
      navigate(`/checkout?item=${dev.id}&finance=${financeMode}`);
    }, 1200);
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Glow overlays */}
      <div className="absolute right-1/4 top-1/4 w-[500px] h-[400px] bg-white/[0.006] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
                STOREFRONT // HARDWARE MARKETPLACE
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight">
              Pocket computers. <br />But make them affordable.
            </h1>
            <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light max-w-lg leading-relaxed">
              Designed to connect instantly to our network. Free of typical retail carrier commission markup fees.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
            <button
              onClick={() => setFinanceMode(true)}
              className={`py-1.5 px-4 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                financeMode 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-brand-gray-300 hover:text-white bg-transparent'
              }`}
            >
              Monthly Financing
            </button>
            <button
              onClick={() => setFinanceMode(false)}
              className={`py-1.5 px-4 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                !financeMode 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-brand-gray-300 hover:text-white bg-transparent'
              }`}
            >
              Buy Outright
            </button>
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
          {devices.map((dev) => (
            <div
              key={dev.id}
              className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 md:p-8 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all duration-300 relative group"
            >
              <div className="space-y-6">
                
                {/* Visual rendering representation */}
                <div className="w-full aspect-[4/3] rounded-xl border border-white/5 bg-black/60 relative overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
                  
                  {/* Bezel frame */}
                  <div className="w-24 h-44 rounded-[28px] border border-white/10 bg-black/85 relative flex flex-col items-center justify-between p-2 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    <div className="w-6 h-1 rounded-full bg-white/15 mt-1" />
                    
                    {dev.id === 'zero' ? (
                      <div className="w-20 h-32 rounded-[20px] bg-[#D1D1D6] text-black font-mono text-[8px] p-2 flex flex-col justify-between text-left select-none">
                        <span className="font-bold">Zero Phone</span>
                        <div className="space-y-1">
                          <div className="h-1 bg-black/70 w-14" />
                          <div className="h-1 bg-black/70 w-16" />
                          <div className="h-1 bg-black/30 w-8" />
                        </div>
                        <span className="text-[6px] text-right font-light">E-Ink Display</span>
                      </div>
                    ) : (
                      <div className="w-20 h-32 rounded-[20px] bg-black border border-white/5 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute w-[200%] h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 animate-pulse" />
                        <Sparkles className="w-4 h-4 text-white/40" />
                      </div>
                    )}
                    
                    <div className="w-8 h-[2px] bg-white/20 rounded-full mb-1" />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-left">
                  <span className="inline-block px-2.5 py-0.5 border border-white/10 rounded-full font-mono text-[9px] text-brand-gray-400 bg-white/[0.02]">
                    WORKS WITH ADAPTIVE AI PLANS
                  </span>

                  <h3 className="font-display text-2xl font-semibold text-white tracking-tight pt-2">
                    {dev.name}
                  </h3>

                  <p className="font-mono text-[10px] text-brand-gray-400 leading-normal font-medium tracking-wide">
                    “{dev.tagline}”
                  </p>

                  <p className="text-xs text-brand-gray-400 font-sans font-light leading-relaxed pt-2">
                    {dev.description}
                  </p>
                </div>
              </div>

              {/* Bottom features/pricing */}
              <div className="space-y-6 pt-6 mt-6 border-t border-white/5">
                <div className="space-y-2 text-left">
                  {dev.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-brand-gray-450">
                      <Check className="w-3 h-3 text-white/50" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-widest">
                    Finish: <span className="text-white font-light">{selectedColor[dev.id]}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {dev.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(prev => ({ ...prev, [dev.id]: color.name }))}
                        className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                          selectedColor[dev.id] === color.name
                            ? 'border-white scale-110'
                            : 'border-white/10'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-left font-mono">
                    <span className="text-[9px] uppercase tracking-widest text-brand-gray-500 block">
                      {financeMode ? 'Financing' : 'Retail Price'}
                    </span>
                    <span className="text-xl font-bold text-white tracking-tight">
                      {financeMode ? `$${dev.financePrice}` : `$${dev.retailPrice}`}
                    </span>
                    <span className="text-[10px] text-brand-gray-400 font-sans font-light">
                      {financeMode ? '/mo' : ' total'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectDevice(dev)}
                    className="py-3 px-5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-1.5 cursor-pointer"
                  >
                    Buy Device
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {addedPhone && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-8 right-8 z-50 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-md flex items-center gap-3 font-mono text-[11px]"
            >
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-brand-gray-300">
                Redirecting with <span className="text-white font-semibold">{addedPhone}</span>...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Check, ShoppingBag, Eye, Info } from 'lucide-react';

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

export default function PhonesSection() {
  const [financeMode, setFinanceMode] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<Record<string, string>>({
    'pro-ultra': 'Matte Carbon',
    'light': 'Aluminum',
    'zero': 'Graphite E-Ink'
  });
  const [cartCount, setCartCount] = useState<number>(0);
  const [addedPhone, setAddedPhone] = useState<string | null>(null);

  const devices: PhoneDevice[] = [
    {
      id: 'pro-ultra',
      name: 'PacMac Pro Ultra',
      tagline: 'Pocket computer. Extreme Edition.',
      description: 'Yes, it has a camera better than your childhood memories. Encased in high-grade titanium to withstand drops and mild existential crises.',
      retailPrice: 599,
      financePrice: 24,
      specs: ['6.8” OLED 120Hz Display', 'Titanium Frame', '5G / Dual eSIM Support', '256GB High-Speed Storage'],
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
      tagline: 'Everything you need. Nothing you don’t.',
      description: 'A beautifully balanced device. Made of aerospace recycled aluminum. Designed for users who want to connect without the corporate premium price.',
      retailPrice: 299,
      financePrice: 12,
      specs: ['6.1” Liquid Retina OLED', 'Recycled Aluminum Shell', '5G / eSIM Support', '128GB Storage'],
      colors: [
        { name: 'Aluminum', hex: '#D1D1D6' },
        { name: 'Midnight Black', hex: '#121212' }
      ],
      imageDesc: 'Aluminum phone profile'
    },
    {
      id: 'zero',
      name: 'PacMac Zero',
      tagline: 'The antidote to scrolling.',
      description: 'A pocket-sized 5.4” low-distraction phone. Features a highly readable E-Ink screen. Built specifically to keep you focused on real life, with weeks of battery.',
      retailPrice: 199,
      financePrice: 8,
      specs: ['5.4” Clear E-Ink Screen', '3-Week Battery Life', '5G Basic Sync', '64GB Minimal Storage'],
      colors: [
        { name: 'Graphite E-Ink', hex: '#2C2C2E' },
        { name: 'Slate Grey', hex: '#636366' }
      ],
      imageDesc: 'E-Ink phone profile'
    }
  ];

  const handleAddToCart = (name: string) => {
    setAddedPhone(name);
    setCartCount((prev) => prev + 1);
    setTimeout(() => {
      setAddedPhone(null);
    }, 2500);
  };

  return (
    <section id="phones" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Top right gradient accent */}
      <div className="absolute right-10 top-20 w-[450px] h-[350px] bg-white/[0.006] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
                02 // DEVICES & HARDWARE
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Pocket computers. <br />But make them affordable.
            </h2>
            <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light max-w-lg leading-relaxed">
              Designed to connect beautifully with our network. Now with slightly fewer carrier markup fees.
            </p>
          </div>

          {/* Pricing Toggle & Cart Counter */}
          <div className="flex items-center gap-6">
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
              <button
                onClick={() => setFinanceMode(true)}
                className={`py-1.5 px-4 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  financeMode 
                    ? 'bg-white text-black font-semibold' 
                    : 'text-brand-gray-300 hover:text-white bg-transparent'
                }`}
              >
                Monthly Finance
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

            {/* Cart indicator */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/[0.02]">
              <ShoppingBag className="w-4.5 h-4.5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold font-mono flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 Devices Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {devices.map((dev) => (
            <div
              key={dev.id}
              className="rounded-2xl border border-white/10 bg-white/[0.01] p-6 md:p-8 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all duration-300 relative group"
            >
              {/* Top Details */}
              <div className="space-y-6">
                
                {/* Simulated visual mockup box - Sleek cinematic card representation */}
                <div className="w-full aspect-[4/3] rounded-xl border border-white/5 bg-black/60 relative overflow-hidden flex items-center justify-center p-4">
                  {/* Phone background shadows */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
                  
                  {/* Simulated screen bezel */}
                  <div className="w-24 h-44 rounded-[28px] border border-white/10 bg-black/80 relative flex flex-col items-center justify-between p-2 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    {/* Speaker ear piece */}
                    <div className="w-6 h-1 rounded-full bg-white/10 mt-1" />
                    
                    {/* E-ink special styling */}
                    {dev.id === 'zero' ? (
                      <div className="w-20 h-32 rounded-[20px] bg-[#E5E5EA] text-black font-mono text-[8px] p-2 flex flex-col justify-between text-left select-none">
                        <span>PacMac Zero</span>
                        <div className="space-y-1">
                          <div className="h-1 bg-black/80 w-12" />
                          <div className="h-1 bg-black/80 w-16" />
                          <div className="h-1 bg-black/40 w-10" />
                        </div>
                        <span className="text-[7px] text-right">3wk batt</span>
                      </div>
                    ) : (
                      /* OLED glow wallpaper lines */
                      <div className="w-20 h-32 rounded-[20px] bg-black border border-white/5 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute w-[200%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 animate-pulse" />
                        <span className="font-mono text-[7px] text-white/50 tracking-widest uppercase">
                          PACMAC 5G
                        </span>
                      </div>
                    )}
                    
                    {/* Home indicator bar */}
                    <div className="w-8 h-[2px] bg-white/20 rounded-full mb-1" />
                  </div>

                  {/* Absolute shadow / reflection glow */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-white/[0.03] rounded-full blur-xl pointer-events-none" />
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest">
                      WORKS WITH ADAPTIVE AI
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-mono text-brand-gray-400">
                      <Info className="w-3 h-3 opacity-60" />
                      Free SIM
                    </span>
                  </div>
                  
                  <h3 className="font-display text-2xl font-semibold text-white tracking-tight">
                    {dev.name}
                  </h3>
                  
                  <p className="font-mono text-[10px] text-brand-gray-400 tracking-wide">
                    {dev.tagline}
                  </p>

                  <p className="text-xs text-brand-gray-400 font-sans font-light leading-relaxed pt-2">
                    {dev.description}
                  </p>
                </div>
              </div>

              {/* Bottom specs / colors / pricing */}
              <div className="space-y-6 pt-6 mt-6 border-t border-white/5">
                {/* Tech Specs bullets */}
                <div className="space-y-1.5 text-left">
                  {dev.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-brand-gray-450">
                      <Check className="w-3 h-3 text-white/60" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                {/* Color choices */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-widest">
                    Finish: <span className="text-white font-light">{selectedColor[dev.id]}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {dev.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(prev => ({ ...prev, [dev.id]: color.name }))}
                        className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                          selectedColor[dev.id] === color.name
                            ? 'border-white ring-1 ring-white/20'
                            : 'border-white/10 hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Price Display and Checkout Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-left font-mono">
                    <span className="text-[9px] uppercase tracking-widest text-brand-gray-500 block">
                      {financeMode ? 'Financing' : 'Retail Price'}
                    </span>
                    <span className="text-xl font-semibold text-white tracking-tight">
                      {financeMode ? `$${dev.financePrice}` : `$${dev.retailPrice}`}
                    </span>
                    <span className="text-[10px] text-brand-gray-400 font-sans font-light">
                      {financeMode ? '/mo' : ' outright'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(dev.name)}
                    className="py-2.5 px-5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all shadow-[0_0_12px_rgba(255,255,255,0.08)] hover:shadow-[0_0_18px_rgba(255,255,255,0.2)] cursor-pointer"
                  >
                    Select Device
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Added Notification Toast */}
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
                Selected <span className="text-white font-semibold">{addedPhone}</span> for checkout
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

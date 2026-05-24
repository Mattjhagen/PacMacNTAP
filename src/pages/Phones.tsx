import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Check, ArrowRight, X, Cpu, Battery, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../utils/storage';

interface Phone {
  id: string;
  name: string;
  price: number;
  financePrice: number;
  specs: {
    display: string;
    chip: string;
    battery: string;
    storage: string;
  };
  description: string;
  colorName: string;
  gradientClass: string;
}

const PHONES_LIST: Phone[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    price: 999,
    financePrice: 41,
    specs: {
      display: "6.1\" Super Retina XDR ProMotion",
      chip: "A17 Pro (3nm architecture)",
      battery: "Up to 23 hours video playback",
      storage: "128GB Obsidian Slate"
    },
    description: "Custom PacMac Slate tint. Built in titanium. Quietly elegant, completely optimized.",
    colorName: "Slate Titanium",
    gradientClass: "from-neutral-800 to-neutral-900 border-neutral-700/50"
  },
  {
    id: "pixel-8-pro",
    name: "Google Pixel 8 Pro",
    price: 899,
    financePrice: 37,
    specs: {
      display: "6.7\" Super Actua Display 120Hz",
      chip: "Google Tensor G3 (Titan M2 security)",
      battery: "24+ hour battery life, 30W fast charge",
      storage: "128GB Obsidian Matte"
    },
    description: "The ultimate AI smartphone. Pure Android, zero bloatware, and direct integration with PacMac network diagnostics.",
    colorName: "Obsidian Black",
    gradientClass: "from-zinc-800 to-zinc-900 border-zinc-700/50"
  },
  {
    id: "nothing-phone-2",
    name: "Nothing Phone (2)",
    price: 649,
    financePrice: 27,
    specs: {
      display: "6.7\" Flexible LTPO OLED",
      chip: "Snapdragon 8+ Gen 1",
      battery: "4700 mAh, 45W charging",
      storage: "256GB Dark Transparent"
    },
    description: "Glyph interface, transparent back layout. Designed for mindful smartphone usage. A beautiful tool that feels different.",
    colorName: "Dark transparent",
    gradientClass: "from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800"
  },
  {
    id: "pacmac-pebble",
    name: "PacMac Pebble Phone",
    price: 349,
    financePrice: 14,
    specs: {
      display: "4.7\" Matte E-Paper Touchscreen",
      chip: "Custom Cortex Energy-Efficient SoC",
      battery: "7-day battery life",
      storage: "32GB Sandstone Gray"
    },
    description: "Our custom minimalist handset. No distraction loops. No colors. Call, text, navigate, play music, and screen with PackieAI. Calm embodied.",
    colorName: "Sandstone Gray",
    gradientClass: "from-stone-800 via-stone-900 to-stone-800 border-stone-700/50"
  }
];

export default function Phones() {
  const [isFinancing, setIsFinancing] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const navigate = useNavigate();

  const handleBuyPhone = (phone: Phone) => {
    addToCart({
      type: 'device',
      name: `${phone.name} (${phone.colorName})`,
      price: isFinancing ? phone.financePrice : phone.price,
      monthlyPrice: isFinancing ? phone.financePrice : undefined,
      isFinanced: isFinancing
    });
    navigate('/checkout');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24">
      {/* Background glow effects */}
      <div className="absolute top-[20%] left-1/3 w-[60vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 md:pt-40">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500">
              PacMac Hardware Storefront
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white mt-2">
              Phones with no bloat.
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-brand-gray-400 max-w-md font-light">
              We sell devices unlocked, clean, and directly set up for eSIM connectivity. No carrier apps preloaded.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center gap-2 bg-neutral-950 border border-white/10 p-1 rounded-lg self-start">
            <button
              onClick={() => setIsFinancing(true)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                isFinancing ? 'bg-white text-black' : 'text-brand-gray-400 hover:text-white'
              }`}
            >
              Financing
            </button>
            <button
              onClick={() => setIsFinancing(false)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                !isFinancing ? 'bg-white text-black' : 'text-brand-gray-400 hover:text-white'
              }`}
            >
              Outright
            </button>
          </div>
        </div>

        {/* Phones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHONES_LIST.map((phone) => (
            <motion.div
              key={phone.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border border-white/5 bg-neutral-950/40 rounded-xl p-6 flex flex-col justify-between group hover:border-white/20 transition-all hover:glow-sm relative overflow-hidden"
            >
              <div>
                {/* Phone Abstract Shape Mockup */}
                <div className={`w-full aspect-[4/5] rounded-lg border bg-gradient-to-br ${phone.gradientClass} mb-6 flex flex-col items-center justify-center p-6 transition-all group-hover:scale-[1.02] shadow-[inset_0_1px_5px_rgba(255,255,255,0.05)]`}>
                  {phone.id === 'pacmac-pebble' ? (
                    <div className="w-[110px] h-[190px] rounded-2xl bg-neutral-900 border-4 border-stone-600 flex flex-col items-center justify-between p-3 relative shadow-2xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-500 absolute top-1.5" />
                      <div className="flex-1 w-full bg-[#f0ede6] text-black rounded font-mono text-[9px] p-2 flex flex-col justify-between overflow-hidden shadow-inner leading-tight">
                        <div>
                          <div className="border-b border-black/20 pb-0.5 mb-1 font-bold">PacMac Pebble</div>
                          <div>10:24 AM</div>
                          <div className="mt-2 text-stone-700">Calm. No distractions.</div>
                        </div>
                        <div className="text-[7px] text-stone-500 text-center">PackieAI Screening Active</div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-stone-600/50 bg-stone-800 flex items-center justify-center text-[8px] text-stone-400 mt-2 font-mono">
                        MENU
                      </div>
                    </div>
                  ) : (
                    <div className="w-[120px] h-[210px] rounded-3xl border-4 border-white/10 flex flex-col items-center justify-between p-3.5 relative bg-black/90 shadow-2xl">
                      {/* Dynamic Notch */}
                      <div className="w-12 h-3.5 bg-black rounded-full absolute top-1.5 flex items-center justify-center border border-white/5" />
                      <div className="flex-1 w-full bg-gradient-to-t from-white/[0.01] to-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                        <Smartphone className="w-8 h-8 text-white/30" />
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-white">{phone.name}</h3>
                <p className="text-[11px] text-brand-gray-500 font-mono mt-0.5">{phone.colorName}</p>
                <p className="text-xs text-brand-gray-400 leading-relaxed font-light mt-3">
                  {phone.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs text-brand-gray-400 font-mono">
                    {isFinancing ? "Finance rate" : "Total Price"}
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-semibold text-white">
                      ${isFinancing ? phone.financePrice : phone.price}
                    </span>
                    <span className="text-[10px] text-brand-gray-500 font-mono">
                      {isFinancing ? "/mo" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPhone(phone)}
                    className="flex-1 py-2 text-xs font-mono border border-white/10 hover:border-white/20 rounded hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Specs
                  </button>
                  <button
                    onClick={() => handleBuyPhone(phone)}
                    className="flex-1 py-2 text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all flex items-center justify-center gap-1"
                  >
                    Buy
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal for Details View */}
        <AnimatePresence>
          {selectedPhone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg bg-neutral-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl p-6"
              >
                <button
                  onClick={() => setSelectedPhone(null)}
                  className="absolute top-4 right-4 p-1 rounded hover:bg-white/5 text-brand-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-semibold tracking-tight text-white mb-1">
                  {selectedPhone.name} Specsheet
                </h3>
                <p className="text-xs text-brand-gray-400 font-mono mb-6">
                  PacMac Network Unlocked • 5G Configured
                </p>

                <div className="space-y-4 font-sans mb-8">
                  <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                    <span className="text-brand-gray-500 font-mono">Display</span>
                    <span className="text-white text-right font-light">{selectedPhone.specs.display}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                    <span className="text-brand-gray-500 font-mono">Chipset</span>
                    <span className="text-white text-right font-light">{selectedPhone.specs.chip}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                    <span className="text-brand-gray-500 font-mono">Battery / Energy</span>
                    <span className="text-white text-right font-light">{selectedPhone.specs.battery}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                    <span className="text-brand-gray-500 font-mono">Capacity / Trim</span>
                    <span className="text-white text-right font-light">{selectedPhone.specs.storage}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setSelectedPhone(null)}
                    className="flex-1 py-2.5 text-xs font-mono border border-white/10 hover:border-white/20 rounded hover:bg-white/5 transition-all text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const phone = selectedPhone;
                      setSelectedPhone(null);
                      handleBuyPhone(phone);
                    }}
                    className="flex-1 py-2.5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    Select device <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

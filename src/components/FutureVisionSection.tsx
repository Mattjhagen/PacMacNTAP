import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Network, Map, Landmark } from 'lucide-react';

export default function FutureVisionSection() {
  const [activeZone, setActiveZone] = useState<number | null>(null);

  // Regional outreach targets represented inside the company's local roadmap
  const expansionZones = [
    { name: 'Appalachian Highlands Initiative', focus: 'Hybrid Fixed Wireless', status: 'Surveying', progress: 20 },
    { name: 'Southside Urban Broadband Corridors', focus: 'Public Multi-Giga Node Mesh', status: 'Funding Approved', progress: 45 },
    { name: 'Rural Plains School Digital Access Network', focus: 'Cell-Tower Co-locations', status: 'Pre-Deployment', progress: 75 },
    { name: 'Coastal Wetlands Outreach', focus: 'Subsidized Satellite Bridges', status: 'Live Testing', progress: 95 },
  ];

  return (
    <section id="vision" className="relative py-24 md:py-36 px-6 md:px-12 bg-black overflow-hidden border-b border-white/5">
      
      {/* Animated slow shifting cinematic gradient background overlay */}
      <div className="absolute inset-0 aurora-glow opacity-60 pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

      {/* Decorative mechanical axis and structural grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0" />
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/[0.04] pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Blueprint-style Interactive Map Radar Side */}
          <div className="lg:col-span-6 relative order-last lg:order-first">
            <div className="border border-white/10 rounded-3xl bg-black/70 p-6 md:p-8 backdrop-blur-md overflow-hidden relative glow-sm">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="font-mono text-xs text-white tracking-widest uppercase">
                    National Expansion Grid
                  </span>
                </div>
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase">
                  UTC-TIME: 2026-REGISTRY
                </span>
              </div>

              {/* Graphic local zone blueprint */}
              <div className="space-y-4">
                <p className="font-mono text-[10px] text-brand-gray-400 mb-2 uppercase leading-normal">
                  Targeted municipal networks mapped for upcoming deployment semesters:
                </p>

                <div className="space-y-3">
                  {expansionZones.map((zone, idx) => (
                    <div
                      key={zone.name}
                      onMouseEnter={() => setActiveZone(idx)}
                      onMouseLeave={() => setActiveZone(null)}
                      className={`p-4 rounded-xl border transition-all duration-300 text-left relative cursor-pointer ${
                        activeZone === idx
                          ? 'bg-white/5 border-white/30 translate-x-1'
                          : 'bg-white/[0.01] border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-display text-sm font-semibold text-white tracking-tight">
                            {zone.name}
                          </h4>
                          <span className="font-mono text-[10px] text-brand-gray-400 block mt-1">
                            Focus Area: {zone.focus}
                          </span>
                        </div>
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded uppercase ${
                          zone.status === 'Live Testing'
                            ? 'bg-white text-black font-semibold'
                            : 'border border-white/10 text-brand-gray-400'
                        }`}>
                          {zone.status}
                        </span>
                      </div>

                      {/* Simple progress bar bar */}
                      <div className="mt-4 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${zone.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text Content Narrative Side */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
                03 // Regional Vision
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>

            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-tight">
              The Future of <br />
              Wireless Starts Local
            </h2>

            <div className="space-y-6 font-sans font-light text-brand-gray-400 text-base md:text-lg leading-relaxed">
              <p>
                Underserved areas across the nation suffer from archaic telecom monopolization, creating extreme pricing structures and stagnant service loops.
              </p>
              <p>
                Our long-range vision centers around localized grid empowerment. By partnering directly with municipalities, school districts, and community hubs, we are building cellular infrastructure designed specifically around the local citizens who fuel those regions.
              </p>
              <p>
                Connecting regions is more than launching cell-towers. It’s about building high-speed coverage parameters that respect domestic accessibility, sustain educational access, and establish digital equity as a permanent standard.
              </p>
            </div>

            {/* Vision mini indicators */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5 font-mono">
              <div>
                <div className="text-white text-2xl font-bold tracking-tight">Q4 2026</div>
                <div className="text-[10px] text-brand-gray-500 uppercase mt-1">First Wave Rollout</div>
              </div>
              <div>
                <div className="text-white text-2xl font-bold tracking-tight">100%</div>
                <div className="text-[10px] text-brand-gray-500 uppercase mt-1">Community Directed</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

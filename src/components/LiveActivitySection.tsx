import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldAlert, BadgeCheck, Play, Pause, ChevronRight } from 'lucide-react';

interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'active';
  text: string;
}

export default function LiveActivitySection() {
  const [logs, setLogs] = useState<TerminalLog[]>([
    { id: '1', timestamp: '20:18:02', type: 'info', text: 'SYSTEM SETUP: PackieAI active and integrated with PacMac Mobile.' },
    { id: '2', timestamp: '20:18:15', type: 'success', text: 'DATABASE: Spam list verified. 0 unrecognized threats.' },
    { id: '3', timestamp: '20:19:04', type: 'warn', text: 'SCREEN: Incoming call from +1 (844) 302-2931 flagged as possible robocall.' },
    { id: '4', timestamp: '20:19:05', type: 'active', text: 'ACTIVE: AI Assistant answered call. Routing conversation.' },
  ]);

  const [scammerMinutesWasted, setScammerMinutesWasted] = useState(1480);
  const [activeInterceptions, setActiveInterceptions] = useState(34);
  const [isFeedRunning, setIsFeedRunning] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll terminal log window
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle scammer minutes incrementing
  useEffect(() => {
    const timer = setInterval(() => {
      if (isFeedRunning) {
        setScammerMinutesWasted((prev) => prev + (Math.random() > 0.4 ? 1 : 0));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isFeedRunning]);

  // Feed log stream simulation
  useEffect(() => {
    if (!isFeedRunning) return;

    const phrases = [
      { text: 'Unknown caller screened on +1 (800) 934-8422. Low threat margin - verified as dental appointment reminder.', type: 'info' as const },
      { text: 'Possible robocall detected: "Premium Health Insurance Upgrade". Blocked.', type: 'warn' as const },
      { text: 'AI assistant answered call from +1 (212) 584-0199. Engaging "Beatrice" persona.', type: 'active' as const },
      { text: 'Spam list synchronized cleanly. No update required.', type: 'success' as const },
      { text: 'Caller disconnected after 4 minutes of chatting with "Beatrice" persona.', type: 'success' as const },
      { text: 'Spam likely avoided. Silenced automated credit card promotion dialer.', type: 'warn' as const },
      { text: 'Call forwarded safely: "Dr. Rivera’s Office" bypassed screener to reach phone.', type: 'success' as const },
      { text: 'Possible robocall detected: +1 (415) 304-4911 flagged as "Unknown Bank Promo".', type: 'active' as const },
    ];

    const interval = setInterval(() => {
      const selected = phrases[Math.floor(Math.random() * phrases.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + Math.random()),
          timestamp: timeStr,
          type: selected.type,
          text: selected.text,
        },
      ].slice(-16)); // Keep maximum 16 logs in memory to fit card footprint cleanly

      // Slightly fluctuate active intercepts
      setActiveInterceptions((prev) => Math.max(28, Math.min(45, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 4200);

    return () => clearInterval(interval);
  }, [isFeedRunning]);

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

  return (
    <section id="live-feed" className="relative py-24 md:py-36 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Decorative backing circles */}
      <div className="absolute right-[10%] top-[20%] w-[450px] h-[450px] rounded-full bg-white/[0.015] blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                   {/* Narrative Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-500 uppercase tracking-widest">
                07 // WATCH IT IN ACTION
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Watch it <br />
              in action
            </h2>

            <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed">
              See how easily PackieAI screens and handles incoming spam behind the scenes. Built as an account-level setting that runs quietly in the PacMac Mobile network database.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 font-mono">
              <div className="border border-white/10 rounded-xl bg-white/[0.01] p-4 text-left">
                <span className="text-[10px] text-brand-gray-500 uppercase block">ASSISTANT CHECKS</span>
                <span className="text-white text-xl md:text-2xl font-bold tracking-tight block mt-0.5 animate-pulse">
                  {scammerMinutesWasted} calls
                </span>
              </div>
              <div className="border border-white/10 rounded-xl bg-white/[0.01] p-4 text-left">
                <span className="text-[10px] text-brand-gray-500 uppercase block">ACTIVE SCREENINGS</span>
                <span className="text-white text-xl md:text-2xl font-bold tracking-tight block mt-0.5">
                  {activeInterceptions} Screened
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setIsFeedRunning(!isFeedRunning)}
                className="font-mono text-[10px] uppercase tracking-wider text-brand-gray-400 hover:text-white border border-white/10 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                {isFeedRunning ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pause Live Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-red-500 fill-red-500 animate-ping" />
                    <span className="text-white">Resume Streaming</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Glowing Terminal Interface Card */}
          <div className="lg:col-span-7 relative h-[430px]">
            {/* Ambient terminal backing flare */}
            <div className="absolute inset-0 bg-white/[0.012] rounded-3xl blur-2xl pointer-events-none" />

            <div className="border border-white/10 rounded-2xl bg-[#090909] h-full flex flex-col overflow-hidden relative shadow-2xl glow-md">
              {/* Terminal Frame header */}
              <div className="bg-[#121212] border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-white" />
                  <span className="font-mono text-[11px] text-brand-gray-400 uppercase tracking-widest font-semibold">
                    Packie_Call_Assistant_Feed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50 animate-pulse" />
                </div>
              </div>

              {/* Terminal Content Stream */}
              <div
                ref={scrollRef}
                className="flex-1 p-6 font-mono text-[11px] md:text-xs overflow-y-auto space-y-3.5 scrollbar-thin text-left bg-black selection:bg-white selection:text-black"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="text-brand-gray-500">// CONNECTED TO PACMAC NETWORK CALL PORT</div>
                
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-brand-gray-550 flex-shrink-0">[{log.timestamp}]</span>
                      <div className="flex-1">
                        <span
                          className={`font-semibold mr-1.5 ${
                            log.type === 'warn'
                              ? 'text-red-400'
                              : log.type === 'success'
                              ? 'text-green-400'
                              : log.type === 'active'
                              ? 'text-blue-300'
                              : 'text-brand-gray-400'
                          }`}
                        >
                          {log.type === 'warn' && '! [SPAM]'}
                          {log.type === 'success' && '✓ [ROUTED]'}
                          {log.type === 'active' && '● [SCREENING]'}
                          {log.type === 'info' && '• [SIGNAL]'}
                        </span>
                        <span className="text-brand-gray-300 leading-relaxed font-light">{log.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Blinking trailing cursor */}
                <div className="flex items-center gap-1 text-brand-gray-400 font-bold pt-1">
                  <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                  <span>Monitoring network call activity...</span>
                  <span className="w-1.5 h-4 bg-white animate-pulse" />
                </div>
              </div>

              {/* Terminal status bar */}
              <div className="bg-[#121212] border-t border-white/5 py-2 px-4 flex items-center justify-between font-mono text-[9px] text-brand-gray-500">
                <span>SERVICE: PACMAC MOBILE INTEGRATED</span>
                <span>STATUS: ACTIVE</span>
                <span className="text-white uppercase font-bold tracking-widest animate-pulse">
                  SYSTEM READY
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

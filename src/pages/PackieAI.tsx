import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldCheck, Radio, AlertTriangle, ArrowRight, MessageSquare, Play, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const SCAM_SCRIPT = [
  { speaker: 'caller', text: "Hello? Yes, this is the legal department of the Treasury requesting immediate return call regarding an outstanding tax fraud judgment..." },
  { speaker: 'packie', text: "Hello. I am screening this line on behalf of the subscriber. Please state the legal entity representative code for verification." },
  { speaker: 'caller', text: "Wait, is this an assistant? Listen, my ID code is Federal Officer 992. Your subscriber must resolve this balance today via credit card or face arrest..." },
  { speaker: 'packie', text: "The IRS does not request immediate credit card wire payments over unsolicited cellular calls, and Officer 992 is not a valid agent ID. I am documenting this transcript. Goodbye." }
];

export default function PackieAI() {
  const [demoState, setDemoState] = useState<'idle' | 'calling' | 'screening' | 'done'>('idle');
  const [dialogLog, setDialogLog] = useState<Array<{ speaker: string; text: string }>>([]);
  const [stepIdx, setStepIdx] = useState(0);

  const startDemo = () => {
    setDemoState('calling');
    setDialogLog([]);
    setStepIdx(0);
  };

  const handleScreenCall = () => {
    setDemoState('screening');
    runDialogStep(0);
  };

  const runDialogStep = (idx: number) => {
    if (idx >= SCAM_SCRIPT.length) {
      setDemoState('done');
      return;
    }
    
    // Add dialogue line
    setTimeout(() => {
      setDialogLog(prev => [...prev, SCAM_SCRIPT[idx]]);
      setStepIdx(idx + 1);
      runDialogStep(idx + 1);
    }, 2200); // Wait between lines to feel real
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24 font-sans">
      {/* Glow */}
      <div className="absolute top-[20%] left-1/3 w-[65vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 md:pt-40">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500">
            Carrier-Level Protection
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white mt-2">
            PackieAI Scam Shield
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-brand-gray-400 leading-relaxed font-light">
            We built a virtual assistant directly into the routing core of our network. Packie answers unknown callers, quizzes them for credentials, and transcribes their answers. If it's spam, we hang up. You never hear the phone vibrate.
          </p>
        </div>

        {/* Split Section: Details vs Phone Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto">
          {/* Details (Left 6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              How it works at the network tower level
            </h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-brand-gray-400 font-light leading-relaxed">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-950 flex items-center justify-center font-mono text-[10px] text-brand-gray-300 shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  An unknown caller dials your number. Instead of sending the ring signal directly to your phone, our routing switch checks the carrier metadata.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-950 flex items-center justify-center font-mono text-[10px] text-brand-gray-300 shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  If they aren't in your address book, Packie answers on the tower. It asks them why they are calling and records their response.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-950 flex items-center justify-center font-mono text-[10px] text-brand-gray-300 shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  Our lightweight, high-performance natural language model checks for fraud scripts (e.g. warranty, tax, utility warnings). If it matches, the line drops. If it's a real person (e.g., your delivery driver), your phone rings with their transcribed explanation.
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Link
                to="/plans"
                className="px-5 py-2.5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all flex items-center gap-1"
              >
                Get Adaptive Line <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Smartphone Simulator (Right 6 cols) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-[300px] h-[580px] rounded-[45px] border-[6px] border-zinc-800 bg-neutral-950 shadow-2xl overflow-hidden relative flex flex-col p-4">
              {/* Dynamic Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center border border-white/5 z-20 shrink-0" />
              
              <div className="flex-1 w-full rounded-[32px] overflow-hidden bg-black flex flex-col justify-between p-4 relative border border-white/5">
                
                {/* Simulated Screen Body */}
                <AnimatePresence mode="wait">
                  {demoState === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                    >
                      <Shield className="w-10 h-10 text-brand-gray-600 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-semibold">Test PackieAI Live</h4>
                        <p className="text-[10px] text-brand-gray-500 font-light mt-1 max-w-[200px] mx-auto">
                          Simulate an incoming scam robo-call and screen it in real time.
                        </p>
                      </div>
                      <button
                        onClick={startDemo}
                        className="px-5 py-2 text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        Trigger Call
                      </button>
                    </motion.div>
                  )}

                  {demoState === 'calling' && (
                    <motion.div
                      key="calling"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col justify-between items-center py-8 text-center"
                    >
                      <div>
                        <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest block animate-pulse">
                          Incoming Call
                        </span>
                        <h4 className="text-base font-semibold mt-1">+1 (800) 829-1040</h4>
                        <span className="text-[9px] text-brand-gray-500 font-mono">Possible Scam: IRS</span>
                      </div>

                      {/* Screen Call CTA */}
                      <div className="w-full space-y-3 px-4">
                        <button
                          onClick={handleScreenCall}
                          className="w-full py-3 bg-neutral-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:glow-sm"
                        >
                          <Radio className="w-4 h-4 text-white animate-pulse" />
                          Screen with PackieAI
                        </button>
                        
                        <div className="flex justify-between text-[8px] text-brand-gray-600 font-mono">
                          <span>Swipe up to decline</span>
                          <span>Slide to accept</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {(demoState === 'screening' || demoState === 'done') && (
                    <motion.div
                      key="screening"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col justify-between text-left"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                        <div>
                          <span className="text-[8px] font-mono text-brand-gray-400 uppercase tracking-wider block">
                            PackieAI Intercept
                          </span>
                          <span className="text-[10px] font-mono text-white truncate max-w-[140px] block">+1 (800) 829-1040</span>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      </div>

                      {/* Dialogue Log */}
                      <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[9px] pr-1 scrollbar-thin">
                        {dialogLog.map((line, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded max-w-[85%] leading-relaxed ${
                              line.speaker === 'packie'
                                ? 'ml-auto bg-white/10 text-white border border-white/5'
                                : 'mr-auto bg-neutral-900 text-brand-gray-300'
                            }`}
                          >
                            <span className="text-[7px] text-brand-gray-500 block uppercase mb-0.5">
                              {line.speaker === 'packie' ? 'PackieAI' : 'Caller'}
                            </span>
                            {line.text}
                          </div>
                        ))}

                        {demoState === 'screening' && (
                          <div className="flex items-center gap-1.5 text-brand-gray-500 py-1 font-mono text-[8px]">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Caller typing/responding...</span>
                          </div>
                        )}
                      </div>

                      {demoState === 'done' && (
                        <div className="border-t border-white/5 pt-3 mt-2 text-center space-y-2 shrink-0">
                          <div className="bg-red-950/20 border border-red-500/10 p-2 rounded flex items-center justify-center gap-1.5 text-[9px] font-mono text-white">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Scam Detected. Connection Disconnected.</span>
                          </div>
                          <button
                            onClick={startDemo}
                            className="text-[9px] font-semibold tracking-tight text-black bg-white hover:bg-brand-gray-200 px-3 py-1 rounded cursor-pointer"
                          >
                            Run test again
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

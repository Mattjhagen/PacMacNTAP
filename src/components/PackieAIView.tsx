import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, Cpu, Sparkles, Terminal, ArrowRight } from 'lucide-react';

export default function PackieAIView() {
  const [testPhrase, setTestPhrase] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    decision: 'SPAM' | 'SAFE' | 'UNKNOWN';
    details: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhrase.trim()) return;

    setLoading(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setLoading(false);
      const query = testPhrase.toLowerCase();

      if (query.includes('irs') || query.includes('tax') || query.includes('gift card') || query.includes('money') || query.includes('won') || query.includes('bank') || query.includes('account')) {
        setAnalysisResult({
          score: 98,
          decision: 'SPAM',
          details: 'High probability of social engineering. Requesting immediate financial action or pre-paid cards.'
        });
      } else if (query.includes('mom') || query.includes('hello') || query.includes('hey') || query.includes('meeting') || query.includes('lunch')) {
        setAnalysisResult({
          score: 4,
          decision: 'SAFE',
          details: 'Conversational greetings match normal peer communication heuristics.'
        });
      } else {
        setAnalysisResult({
          score: 72,
          decision: 'SPAM',
          details: 'Unsolicited notification pattern matching robocall outbound scripts.'
        });
      }
    }, 1200);
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Lighting visuals */}
      <div className="absolute left-1/3 top-1/4 w-[500px] h-[400px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-left space-y-4 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
              TECHNOLOGY PROFILE // PACKIEAI SPAM SHIELD
            </span>
            <div className="h-[1px] w-12 bg-brand-gray-800" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
            Telecom security, <br />run by mathematical models.
          </h1>
          <p className="text-sm md:text-base text-brand-gray-400 font-sans font-light leading-relaxed">
            PackieAI screens incoming audio streams and SMS contents locally, intercepting scam activity before your device even vibrates.
          </p>
        </div>

        {/* Core telemetry details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Diagnostic simulator (Left) */}
          <div className="lg:col-span-7 border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[9px] text-brand-gray-550 uppercase">PACKIEAI ENGINE TESTER</span>
                <h3 className="font-display text-lg font-bold text-white mt-0.5">Scam Heuristic Scanner</h3>
              </div>
              <p className="text-xs text-brand-gray-400 font-light">
                Type an incoming voicemail or SMS text snippet below to inspect the real-time spam detection analysis.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Simulation Phrase</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., 'This is officer Matthews from the IRS. You owe $4000. Send Apple gift cards immediately.'"
                  value={testPhrase}
                  onChange={(e) => setTestPhrase(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-sans text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-center text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 disabled:bg-brand-gray-800 disabled:text-brand-gray-550 rounded-xl transition-all cursor-pointer"
                >
                  {loading ? 'Evaluating Heuristics...' : 'Scan Screening Payload'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setTestPhrase('Hey honey! Just checking if we are still meeting at noon for lunch.')}
                  className="px-4 py-3 border border-white/10 hover:border-white/20 text-brand-gray-400 hover:text-white rounded-xl font-mono text-[10px] cursor-pointer"
                >
                  Load Safe SMS
                </button>
              </div>
            </form>

            <AnimatePresence mode="wait">
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-xl border font-mono text-[11px] space-y-2 text-left ${
                    analysisResult.decision === 'SPAM'
                      ? 'border-red-500/20 bg-red-500/[0.01]'
                      : 'border-emerald-500/20 bg-emerald-500/[0.01]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-brand-gray-450">SCAN CONCLUSION:</span>
                    <span className={`font-bold flex items-center gap-1.5 ${
                      analysisResult.decision === 'SPAM' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {analysisResult.decision === 'SPAM' ? (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> SPAM BLOCKED
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" /> SAFE PASSAGE
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-brand-gray-450">SPAM CONFIDENCE SCORE:</span>
                    <span className="text-white font-bold">{analysisResult.score}%</span>
                  </div>

                  <p className="text-[10px] text-brand-gray-300 leading-relaxed border-t border-white/5 pt-2 mt-2">
                    {analysisResult.details}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Core Analytics parameters (Right) */}
          <div className="lg:col-span-5 border border-white/10 bg-white/[0.01] rounded-2xl p-6 text-left space-y-6 flex flex-col justify-between backdrop-blur-md font-mono text-xs">
            <div className="space-y-6">
              <div>
                <span className="text-[9px] text-brand-gray-550 uppercase tracking-widest block">GLOBAL PROTECTION telemetry</span>
                <h3 className="font-display text-lg font-bold text-white mt-1">Live Intercept Analytics</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-white/5 bg-black/60 rounded-xl space-y-1">
                  <span className="text-[10px] text-brand-gray-500 block uppercase">SCAM CALL INTERCEPTS</span>
                  <span className="text-xl font-bold text-white tracking-tight block">148,902</span>
                  <span className="text-[8px] text-emerald-400">● REAL-TIME SWITCH BLOCKS</span>
                </div>

                <div className="p-4 border border-white/5 bg-black/60 rounded-xl space-y-1">
                  <span className="text-[10px] text-brand-gray-500 block uppercase">PHISHING SMS FILTERED</span>
                  <span className="text-xl font-bold text-white tracking-tight block">642,801</span>
                  <span className="text-[8px] text-emerald-400">● LOCAL CONTENT HASH VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] leading-relaxed text-[10px] text-brand-gray-450 font-sans font-light">
              Unlike commercial filters, PackieAI runs directly on our carrier routing core, meaning your cell processor doesn't burn battery running heavy classification models.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

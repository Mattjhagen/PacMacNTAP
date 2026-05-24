import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Cpu, Smartphone, RefreshCw, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSession, setSession } from '../utils/storage';

export default function ESIM() {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const navigate = useNavigate();

  const handleVerifyLine = () => {
    setIsVerifying(true);
    setVerifyStatus('idle');

    // Simulate carrier handshake check
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyStatus('success');

      // Update current session to active if exists
      const session = getSession();
      if (session) {
        session.status = 'active';
        setSession(session);
      }
    }, 2500);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24">
      {/* Background glow and subtle grids */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[75vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 md:pt-40">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500">
            Activation Assistant
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-2">
            Configure your eSIM profile.
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-brand-gray-400 font-light">
            Scan the QR profile below on your handset to automatically configure network APN, signal, and billing linkages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* QR Code and verify checker (Left 5 cols) */}
          <div className="lg:col-span-5 border border-white/5 bg-neutral-950/40 rounded-xl p-8 flex flex-col items-center justify-between text-center relative">
            <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest mb-6">
              Scan QR Profile
            </h3>

            {/* QR Mock Screen */}
            <div className="relative w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center mb-6">
              {/* Corner borders visual decorator */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-sm pointer-events-none" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-sm pointer-events-none" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-sm pointer-events-none" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-sm pointer-events-none" />

              <QrCode className="w-full h-full text-black" />
            </div>

            <div className="w-full border-t border-white/5 pt-6 mt-2 space-y-4">
              {verifyStatus === 'success' ? (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Cellular Sync Confirmed</span>
                    <span className="text-[10px] text-brand-gray-400 font-mono">Line is online and active</span>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-2 text-[11px] font-semibold tracking-tight text-black bg-white px-4 py-1.5 rounded hover:bg-brand-gray-200 transition-all flex items-center gap-1"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleVerifyLine}
                  disabled={isVerifying}
                  className="w-full py-2.5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Awaiting network ping...
                    </>
                  ) : (
                    "Verify Handshake Status"
                  )}
                </button>
              )}
              <span className="block text-[9px] font-mono text-brand-gray-500">
                Line Identifier: eSIM-80922-PACMAC
              </span>
            </div>
          </div>

          {/* Guide Steps (Right 7 cols) */}
          <div className="lg:col-span-7 border border-white/5 bg-neutral-950/40 rounded-xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest">
                Installation Instructions
              </h3>

              {/* OS Selector Toggle */}
              <div className="flex gap-1 bg-neutral-950 border border-white/10 p-0.5 rounded text-[10px]">
                <button
                  onClick={() => setPlatform('ios')}
                  className={`px-3 py-1 rounded transition-colors ${
                    platform === 'ios' ? 'bg-white text-black font-semibold' : 'text-brand-gray-400 hover:text-white'
                  }`}
                >
                  iOS
                </button>
                <button
                  onClick={() => setPlatform('android')}
                  className={`px-3 py-1 rounded transition-colors ${
                    platform === 'android' ? 'bg-white text-black font-semibold' : 'text-brand-gray-400 hover:text-white'
                  }`}
                >
                  Android
                </button>
              </div>
            </div>

            {platform === 'ios' ? (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center text-[10px] text-brand-gray-400 font-mono shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Open System Settings</h4>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Unlock your iPhone and navigate to <strong className="text-white font-normal">Settings &gt; Cellular</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center text-[10px] text-brand-gray-400 font-mono shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Add eSIM Profile</h4>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Tap <strong className="text-white font-normal">Add eSIM</strong>, then choose <strong className="text-white font-normal">Use QR Code</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center text-[10px] text-brand-gray-400 font-mono shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Scan & Configure</h4>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Focus your camera frame on the QR code on the left. Once registered, designate PacMac as your primary cellular data line.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center text-[10px] text-brand-gray-400 font-mono shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Open Connections Settings</h4>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Open device <strong className="text-white font-normal">Settings &gt; Network & Internet &gt; SIMs</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center text-[10px] text-brand-gray-400 font-mono shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Download eSIM Profile</h4>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Select <strong className="text-white font-normal">Download a SIM instead?</strong> or <strong className="text-white font-normal">Add SIM</strong>, then choose scan mode.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center text-[10px] text-brand-gray-400 font-mono shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Scan Code</h4>
                    <p className="text-xs text-brand-gray-400 leading-relaxed font-light">
                      Center your device camera over the QR code on the left. Approve the network profile installation. Done.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

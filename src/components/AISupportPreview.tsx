import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Shield, RefreshCw, AlertTriangle, User, UserCheck, Bot, Check, Sparkles, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'otp' | 'provisioning' | 'escalation';
    status: 'pending' | 'success' | 'failed';
  };
}

export default function AISupportPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hey. I'm Packie. I have direct access to our core routing systems, which means I can reprovision lines, swap eSIM profiles, and diagnose cell tower attachments. No flowcharts or canned loops. What's going on with your device?",
      timestamp: '10:02 AM'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [typing, setTyping] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [provisioningProgress, setProvisioningProgress] = useState<number>(0);
  const [provisioningDone, setProvisioningDone] = useState<boolean>(false);
  const [sessionMood, setSessionMood] = useState<string>('Calm');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addMessage = (sender: 'user' | 'ai', text: string, card?: ChatMessage['actionCard']) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      sender,
      text,
      timestamp: time,
      actionCard: card
    }]);
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    addMessage('user', text);
    if (!textToSend) setInputText('');
    setTyping(true);

    // AI logic response mock based on keyword matches
    setTimeout(() => {
      setTyping(false);
      const query = text.toLowerCase();

      if (query.includes('data') || query.includes('service') || query.includes('connection') || query.includes('signal') || query.includes('refresh')) {
        addMessage('ai', "Looks like your tower connection got stuck after the update. I can re-initialize the connection directly on the MNO routing switch. Shall I execute a line sync?", {
          type: 'provisioning',
          status: 'pending'
        });
      } 
      else if (query.includes('bill') || query.includes('pricing') || query.includes('charge') || query.includes('higher') || query.includes('different')) {
        addMessage('ai', "Your usage dropped by 12GB last month, so your bill adjusted automatically to the $30 Standard Tier. No need to call or negotiate.");
      }
      else if (query.includes('switch') || query.includes('sim') || query.includes('swap') || query.includes('phone')) {
        addMessage('ai', "To keep SIM swaps secure, I have sent a 4-digit verification code to your registered phone. Please enter it here.", {
          type: 'otp',
          status: 'pending'
        });
      }
      else if (query.includes('human') || query.includes('agent') || query.includes('escalate') || query.includes('ticket') || query.includes('help')) {
        setSessionMood('Frustrated');
        addMessage('ai', "Got it. Let me bundle your network status metrics and active chat context directly into an operations ticket. A human engineer will review it in our control room. Sound good?", {
          type: 'escalation',
          status: 'pending'
        });
      }
      else {
        addMessage('ai', "I can reprovision your connection profile, authorize a SIM swap, adjust billing brackets, or escalate to human operations. Just let me know what you need.");
      }
    }, 1200);
  };

  // Run MNO reset simulation
  const startProvisioning = (msgId: string) => {
    setProvisioningProgress(5);
    setProvisioningDone(false);
    
    const interval = setInterval(() => {
      setProvisioningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProvisioningDone(true);
          // Update message state
          setMessages(current => current.map(m => m.id === msgId ? { ...m, actionCard: { type: 'provisioning', status: 'success' } } : m));
          // Trigger follow-up AI message
          setTimeout(() => {
            addMessage('ai', "Your line refresh completed. MNO routing nodes updated. Try toggling your device's Airplane Mode off and on to download the new tower attachments.");
          }, 800);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // OTP simulation
  const handleVerifyOtp = (msgId: string) => {
    if (otpCode === '1904' || otpCode.length === 4) {
      setOtpVerified(true);
      setMessages(current => current.map(m => m.id === msgId ? { ...m, actionCard: { type: 'otp', status: 'success' } } : m));
      setTimeout(() => {
        addMessage('ai', "Identity verified. Your eSIM transfer is ready. You can scan the QR code under the eSIM view or accept the system push request.");
      }, 800);
    } else {
      alert("Please enter a 4-digit code (e.g. 1904) to simulate authentication.");
    }
  };

  // Human Escalation simulation
  const handleEscalateTicket = (msgId: string) => {
    const ticketId = `PAC-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Write ticket data to window object so AdminDashboardPreview can read it!
    const activeTicket = {
      id: ticketId,
      customer: "Matty Hagen",
      phone: "+1 (555) 019-4820",
      issue: "Carrier Profile Provision Failure & SIM swap escalation",
      diag: {
        imei: "354920194850123",
        frustration: "High",
        stepsTried: ["MNO line scan", "APN reset attempt"],
        timestamp: new Date().toLocaleTimeString()
      },
      status: "OPEN",
      time: "Just now"
    };

    // Store in window/localStorage
    const currentTickets = JSON.parse(localStorage.getItem('pacmac_tickets') || '[]');
    localStorage.setItem('pacmac_tickets', JSON.stringify([activeTicket, ...currentTickets]));

    setMessages(current => current.map(m => m.id === msgId ? { ...m, actionCard: { type: 'escalation', status: 'success' } } : m));
    
    setTimeout(() => {
      addMessage('ai', `Diagnostic bundle compiled. Ticket #${ticketId} created. An administrator has been notified. You can track this in the operations logs.`);
    }, 800);
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Diagnostic Stats panel (Left) */}
          <div className="lg:col-span-4 border border-white/10 bg-white/[0.01] rounded-2xl p-6 text-left space-y-6 flex flex-col justify-between backdrop-blur-md">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[9px] text-brand-gray-500 uppercase tracking-widest block">
                  SUPPORT CONSOLE // TELEMETRY
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  Session Telemetry
                </h3>
              </div>

              {/* Status metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 border border-white/5 bg-black/60 rounded-xl font-mono text-[10px]">
                  <span className="text-brand-gray-500 block">DEVICE</span>
                  <span className="text-white block mt-0.5 font-semibold">iPhone 15 Pro</span>
                </div>
                <div className="p-3.5 border border-white/5 bg-black/60 rounded-xl font-mono text-[10px]">
                  <span className="text-brand-gray-550 block">CARRIER NODE</span>
                  <span className="text-white block mt-0.5 font-semibold">NYC-MNO-104</span>
                </div>
                <div className="p-3.5 border border-white/5 bg-black/60 rounded-xl font-mono text-[10px]">
                  <span className="text-brand-gray-550 block">PROVISION STATUS</span>
                  <span className="text-emerald-400 block mt-0.5 font-semibold">ACTIVE</span>
                </div>
                <div className="p-3.5 border border-white/5 bg-black/60 rounded-xl font-mono text-[10px]">
                  <span className="text-brand-gray-550 block">USER MOOD DETECTOR</span>
                  <span className={`block mt-0.5 font-semibold ${sessionMood === 'Frustrated' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {sessionMood}
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-[10px] text-brand-gray-450 border-t border-white/5 pt-5">
                <div className="flex justify-between">
                  <span>Authentication State:</span>
                  <span className="text-white">Sim-Verified (OTP Pending)</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Sync Rating:</span>
                  <span className="text-emerald-400 font-semibold">98.4%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-white" />
                <span className="font-display text-xs font-semibold text-white">Security Protocol</span>
              </div>
              <p className="text-[10px] text-brand-gray-450 font-light leading-relaxed">
                Sensitive workflows (SIM swaps, invoices) run an automated identity lock. OTP verification is required to authorize writes.
              </p>
            </div>
          </div>

          {/* Interactive Support Chat (Right) */}
          <div className="lg:col-span-8 border border-white/10 bg-white/[0.01] rounded-2xl flex flex-col h-[75vh] backdrop-blur-md relative overflow-hidden">
            
            {/* Top Bar */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/50 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-white block">Packie support AI</span>
                  <span className="text-[9px] text-emerald-400 font-mono block">System Connection Status: STABLE</span>
                </div>
              </div>

              {/* Reset button */}
              <button
                onClick={() => setMessages([
                  {
                    id: '1',
                    sender: 'ai',
                    text: "Hey. I'm Packie. I have direct access to our core routing systems, which means I can reprovision lines, swap eSIM profiles, and diagnose cell tower attachments. No flowcharts or canned loops. What's going on with your device?",
                    timestamp: '10:02 AM'
                  }
                ])}
                className="py-1 px-2 border border-white/10 text-brand-gray-400 hover:text-white rounded font-mono text-[8px] cursor-pointer hover:bg-white/[0.02]"
              >
                Clear History
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] text-left ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'border-white/20 bg-white/10'
                      : 'border-white/10 bg-black/60'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-3">
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-sans ${
                      msg.sender === 'user'
                        ? 'border-white/10 bg-white/5 text-white rounded-tr-none'
                        : 'border-white/5 bg-black/60 text-brand-gray-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Inline Action Cards */}
                    {msg.actionCard && (
                      <div className="border border-white/10 bg-black/80 rounded-xl p-4 space-y-4 max-w-sm">
                        
                        {/* OTP Verification CARD */}
                        {msg.actionCard.type === 'otp' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] text-brand-gray-500 uppercase">IDENTITY SECURITY LOCK</span>
                              {msg.actionCard.status === 'success' ? (
                                <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> VERIFIED
                                </span>
                              ) : (
                                <span className="font-mono text-[9px] text-amber-400">PENDING</span>
                              )}
                            </div>

                            {msg.actionCard.status === 'success' ? (
                              <div className="flex items-center gap-2 p-2 border border-emerald-500/20 bg-emerald-500/[0.02] rounded-lg">
                                <UserCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-mono text-emerald-300">Identity successfully authorized.</span>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="Enter 4-digit code (e.g. 1904)"
                                  value={otpCode}
                                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                  className="flex-1 bg-black border border-white/15 rounded-lg px-3 py-2 font-mono text-[10px] text-white focus:outline-none"
                                />
                                <button
                                  onClick={() => handleVerifyOtp(msg.id)}
                                  className="px-3 py-2 text-[10px] font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-lg cursor-pointer"
                                >
                                  Submit OTP
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Line Provisioning CARD */}
                        {msg.actionCard.type === 'provisioning' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] text-brand-gray-500 uppercase">MNO CONNECTION SCAN</span>
                              {msg.actionCard.status === 'success' ? (
                                <span className="font-mono text-[9px] text-emerald-400">SUCCESS</span>
                              ) : (
                                <span className="font-mono text-[9px] text-amber-400">WAITING APPROVAL</span>
                              )}
                            </div>

                            {msg.actionCard.status === 'success' ? (
                              <div className="p-2 border border-emerald-500/20 bg-emerald-500/[0.02] rounded-lg font-mono text-[10px] text-emerald-300 text-left">
                                Provision updated. Carrier DB sync success.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {provisioningProgress > 0 && (
                                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                    <div className="bg-white h-full transition-all duration-300" style={{ width: `${provisioningProgress}%` }} />
                                  </div>
                                )}
                                <button
                                  onClick={() => startProvisioning(msg.id)}
                                  disabled={provisioningProgress > 0}
                                  className="w-full py-2 text-center text-[10px] font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 disabled:bg-brand-gray-800 disabled:text-brand-gray-500 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${provisioningProgress > 0 ? 'animate-spin' : ''}`} />
                                  {provisioningProgress > 0 ? `Reprovisioning Network... ${provisioningProgress}%` : 'Execute Provision Refresh'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Support Escalation CARD */}
                        {msg.actionCard.type === 'escalation' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] text-brand-gray-500 uppercase">TIER 2 OPERATIONS DESPATCH</span>
                              {msg.actionCard.status === 'success' ? (
                                <span className="font-mono text-[9px] text-emerald-400">ESCALATED</span>
                              ) : (
                                <span className="font-mono text-[9px] text-red-400">ACTION REQUIRED</span>
                              )}
                            </div>

                            {msg.actionCard.status === 'success' ? (
                              <div className="p-2.5 border border-emerald-500/20 bg-emerald-500/[0.02] rounded-lg font-mono text-[9px] text-emerald-300 space-y-1">
                                <div className="flex justify-between">
                                  <span>Ticket ID:</span>
                                  <span className="font-bold">PAC-QUEUED</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Admin Notify Status:</span>
                                  <span>SENT</span>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEscateTicket(msg.id)}
                                className="w-full py-2 text-center text-[10px] font-mono font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Authorize Support Escalation
                              </button>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex gap-3 max-w-[85%] text-left mr-auto">
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-black/60 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl border border-white/5 bg-black/60 text-brand-gray-500 font-mono text-[10px] rounded-tl-none flex items-center gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-75">●</span>
                    <span className="animate-bounce delay-150">●</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Option suggestion buttons */}
            <div className="px-6 py-3 border-t border-white/5 bg-black/40 overflow-x-auto flex gap-2 whitespace-nowrap scrollbar-none z-10">
              <button
                onClick={() => handleSend("Refresh my connection")}
                className="py-1.5 px-3 border border-white/10 hover:border-white/20 text-brand-gray-300 hover:text-white rounded-xl font-mono text-[9px] cursor-pointer bg-white/[0.01]"
              >
                📡 Reset Tower Provision
              </button>
              <button
                onClick={() => handleSend("Why is my bill higher?")}
                className="py-1.5 px-3 border border-white/10 hover:border-white/20 text-brand-gray-300 hover:text-white rounded-xl font-mono text-[9px] cursor-pointer bg-white/[0.01]"
              >
                💵 Explain Alien Invoice
              </button>
              <button
                onClick={() => handleSend("Request eSIM transfer")}
                className="py-1.5 px-3 border border-white/10 hover:border-white/20 text-brand-gray-300 hover:text-white rounded-xl font-mono text-[9px] cursor-pointer bg-white/[0.01]"
              >
                📲 eSIM/SIM Swap Authentication
              </button>
              <button
                onClick={() => handleSend("Escalate to human support")}
                className="py-1.5 px-3 border border-white/10 hover:border-white/20 text-brand-gray-300 hover:text-white rounded-xl font-mono text-[9px] cursor-pointer bg-white/[0.01]"
              >
                🚨 Tier-2 Human Ticket
              </button>
            </div>

            {/* Input Bar */}
            <div className="px-6 py-4 border-t border-white/10 bg-black flex gap-2 z-10">
              <input
                type="text"
                placeholder="Ask PackieSupport anything (e.g. tower resets, invoices, escalations)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 font-sans text-xs text-white placeholder-brand-gray-550 focus:border-white/30 focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleSend()}
                className="w-10 h-10 rounded-xl bg-white hover:bg-brand-gray-150 text-black flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

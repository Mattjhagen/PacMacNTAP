import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Send, Radio, User, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supportService } from '../services/supportService';
import { usageService } from '../services/usageService';
import { supabase } from '../utils/supabaseClient';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isAction?: boolean;
}

export default function Support() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    const cached = sessionStorage.getItem('pacmac_support_chat_history');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('there');
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userContext, setUserContext] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('pacmac_support_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    async function loadSessionName() {
      setUserId(user!.id);
      setUserName(user!.name || 'Member');
      
      let dataUsedGb = 8.4;
      let deviceName = user!.device || 'Unlocked Phone';
      
      try {
        const usageData = await usageService.getUsageData(user!.id);
        dataUsedGb = usageData.dataUsedGb;
      } catch {}

      try {
        const { data: dbDevices } = await supabase
          .from('devices')
          .select()
          .eq('profile_id', user!.id);
        if (dbDevices && dbDevices.length > 0) {
          deviceName = `${dbDevices[dbDevices.length - 1].brand} ${dbDevices[dbDevices.length - 1].model}`;
        }
      } catch {}

      const lastDiagnosticsTime = sessionStorage.getItem('pacmac_last_diagnostics');
      const lastTicketId = sessionStorage.getItem('pacmac_last_ticket_id');

      const context = {
        name: user!.name || 'Member',
        phone: user!.phone || '+1 (510) 555-0198',
        device: deviceName,
        dataUsedGb,
        simType: (user as any).simType || 'eSIM',
        lastDiagnosticsTime,
        lastTicketId
      };

      setUserContext(context);

      if (messages.length === 0) {
        let welcomeText = `Hi ${user!.name || 'there'}. I'm the PacMac line assistant. I can refresh your cellular signal, analyze your billing invoices, or configure eSIM connections. How can I help you today?`;
        
        if (lastDiagnosticsTime) {
          welcomeText = `Hi ${user!.name || 'there'}. I noticed you ran network diagnostics from the dashboard recently. The APN registration and latency look solid from our end. Let me know if you need to explain your bills or escalate a ticket.`;
        } else if (lastTicketId) {
          welcomeText = `Welcome back, ${user!.name || 'there'}. I see we have an active SF Operations ticket (#${lastTicketId}) queued for your account. I can refresh connection signals or review billing details while you wait.`;
        }

        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: welcomeText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }

    loadSessionName();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyText = supportService.getAIResponse(userMsg.text, userContext);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  const executeAction = async (actionType: 'refresh' | 'bill' | 'ticket') => {
    const userText = actionType === 'refresh' ? "Diagnostics: Refresh my line signal." : 
                     actionType === 'bill' ? "Explain my billing updates." : "Generate escalation support ticket.";
    
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    if (actionType === 'refresh') {
      const logs = await supportService.runNetworkDiagnostics();
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: `🔄 Handshake flush dispatches completed: ${logs[logs.length - 1]} Your cellular antenna connection has been reset successfully.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } else if (actionType === 'bill') {
      setIsTyping(false);
      const reply = supportService.getAIResponse('bill', userContext);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } else {
      const { id } = await supportService.createTicket({
        type: 'billing',
        subject: 'Ops Escalation Line Hook',
        details: 'User requested desk support'
      }, userId);
      
      sessionStorage.setItem('pacmac_last_ticket_id', id);
      setUserContext((prev: any) => ({
        ...prev,
        lastTicketId: id
      }));

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: `👤 SF Operations desk ticket generated successfully (Reference: #${id}). One of our network engineers will respond to your email shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-16 sm:pb-24 font-sans font-light">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 sm:pt-32 md:pt-40 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-10">
          <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-brand-gray-500 block">
            System Operations Assistant
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1">
            Network Support Hub.
          </h1>
          <p className="mt-2 text-[11px] sm:text-xs sm:text-sm text-brand-gray-400 font-light">
            Need diagnostics pings or billing audit breakdowns? Our system bot diagnoses active account states instantly.
          </p>
        </div>

        {/* Support Chat Box */}
        <div className="w-full max-w-2xl border border-white/5 bg-neutral-950/40 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl flex flex-col h-[450px] sm:h-[520px]">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-neutral-950">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded border border-white/10 bg-white/5 flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">PacMac System Assistant</span>
                <span className="text-[9px] font-mono text-brand-gray-500 uppercase tracking-widest">
                  Signal & Billing Diagnostics
                </span>
              </div>
            </div>
            {userName !== 'there' && (
              <span className="text-[9px] font-mono text-brand-gray-500">
                Connected: {userName}
              </span>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-[10px] sm:text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="text-[8px] text-brand-gray-500 mb-0.5 uppercase">
                  {msg.sender === 'user' ? 'Member' : 'Assistant'}
                </span>
                <div
                  className={`p-3 rounded-lg leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-neutral-900 border border-white/10 text-white'
                      : 'bg-white/5 text-brand-gray-300 font-light'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-brand-gray-500 font-mono text-[9px] py-1">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>Assistant screening network state...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Diagnostics Actions Bar */}
          <div className="px-6 py-2 border-t border-white/5 bg-neutral-950 flex flex-wrap gap-2">
            <button
              onClick={() => executeAction('refresh')}
              className="px-3 py-1.5 text-[9px] font-mono border border-white/10 hover:border-white/20 rounded bg-white/5 text-white transition-all cursor-pointer"
            >
              🔄 Refresh Connection
            </button>
            <button
              onClick={() => executeAction('bill')}
              className="px-3 py-1.5 text-[9px] font-mono border border-white/10 hover:border-white/20 rounded bg-white/5 text-white transition-all cursor-pointer"
            >
              💵 Explain My Bill
            </button>
            <button
              onClick={() => executeAction('ticket')}
              className="px-3 py-1.5 text-[9px] font-mono border border-white/10 hover:border-white/20 rounded bg-white/5 text-white transition-all cursor-pointer"
            >
              👤 Ticket Escalation
            </button>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-neutral-950 flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about eSIM settings, pricing scaling, signals..."
              className="flex-1 bg-neutral-950 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
            />
            <button
              type="submit"
              className="p-2.5 rounded bg-white hover:bg-brand-gray-200 text-black transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

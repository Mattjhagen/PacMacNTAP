import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, RefreshCw, Radio, HardDrive, ShieldAlert, Check, UserCheck, AlertTriangle } from 'lucide-react';

interface SupportTicket {
  id: string;
  customer: string;
  phone: string;
  issue: string;
  diag: {
    imei: string;
    frustration: string;
    stepsTried: string[];
    timestamp: string;
  };
  status: string;
  time: string;
}

interface OrderRecord {
  id: string;
  item: string;
  amount: number;
  customer: string;
  status: string;
  time: string;
}

export default function AdminDashboardPreview() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders' | 'telemetry'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Synchronize queue from localStorage on load/tab switch
  const loadData = () => {
    // Load tickets
    const localTickets = JSON.parse(localStorage.getItem('pacmac_tickets') || '[]');
    const defaultTickets: SupportTicket[] = [
      {
        id: 'PAC-8402',
        customer: 'John Doe',
        phone: '+1 (555) 012-9402',
        issue: 'No Signal after local iOS update',
        diag: {
          imei: '359402194850381',
          frustration: 'Medium',
          stepsTried: ['Airplane mode cycle'],
          timestamp: '10:05 AM'
        },
        status: 'OPEN',
        time: '2 hours ago'
      },
      {
        id: 'PAC-7394',
        customer: 'Sarah Smith',
        phone: '+1 (555) 014-9904',
        issue: 'SIM swap request authentication failure',
        diag: {
          imei: '354820194850239',
          frustration: 'High',
          stepsTried: ['OTP fail limit reached'],
          timestamp: '09:40 AM'
        },
        status: 'OPEN',
        time: '3 hours ago'
      }
    ];
    setTickets(localTickets.length > 0 ? [...localTickets, ...defaultTickets] : defaultTickets);

    // Load orders
    const localOrders = JSON.parse(localStorage.getItem('pacmac_orders') || '[]');
    const defaultOrders: OrderRecord[] = [
      { id: 'PAC-ORD-7740', item: 'PacMac Pro Ultra (Titanium)', amount: 24.00, customer: 'John Doe', status: 'COMPLETED', time: '1 hour ago' },
      { id: 'PAC-ORD-1804', item: 'Triple-cut Physical SIM Order', amount: 5.00, customer: 'Sarah Smith', status: 'COMPLETED', time: '3 hours ago' }
    ];
    setOrders(localOrders.length > 0 ? [...localOrders, ...defaultOrders] : defaultOrders);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleAction = (type: 'provision' | 'sim' | 'ticket', id: string) => {
    alert(`Success: Operational action [${type.toUpperCase()}] executed for record ${id}.`);
    if (type === 'ticket') {
      // Remove ticket from list
      const updatedTickets = tickets.filter(t => t.id !== id);
      setTickets(updatedTickets);
      localStorage.setItem('pacmac_tickets', JSON.stringify(updatedTickets.filter(t => !['PAC-8402', 'PAC-7394'].includes(t.id))));
      setSelectedTicket(null);
    }
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Futuristic telemetry background elements */}
      <div className="absolute right-10 top-20 w-[500px] h-[400px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Header telemetry blocks */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-gray-550 uppercase tracking-widest">
                TELECOM COMMAND CENTER // GLOBAL ADMIN TELEMETRY
              </span>
              <div className="h-[1px] w-12 bg-brand-gray-800" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Operational control desk.
            </h1>
            <p className="text-sm text-brand-gray-400 font-sans font-light max-w-md">
              Real-time monitoring panel displaying incoming device checkouts, eSIM activations, network loads, and escalated user support logs.
            </p>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 border border-white/10 bg-white/[0.01] rounded-2xl font-mono text-[10px] space-y-1 min-w-[130px]">
              <span className="text-brand-gray-550 block">MNO BANDWIDTH</span>
              <span className="text-lg font-bold text-white block">1.84 Gbps</span>
              <span className="text-[8px] text-emerald-400">● 99.99% UPTIME</span>
            </div>
            <div className="p-4 border border-white/10 bg-white/[0.01] rounded-2xl font-mono text-[10px] space-y-1 min-w-[130px]">
              <span className="text-brand-gray-550 block">ACTIVE eSIMS</span>
              <span className="text-lg font-bold text-white block">1,940</span>
              <span className="text-[8px] text-brand-gray-400">+12% THIS CYCLE</span>
            </div>
            <div className="p-4 border border-white/10 bg-white/[0.01] rounded-2xl font-mono text-[10px] space-y-1 min-w-[130px]">
              <span className="text-brand-gray-550 block">OPEN TICKETS</span>
              <span className="text-lg font-bold text-white block">{tickets.filter(t => t.status === 'OPEN').length}</span>
              <span className="text-[8px] text-red-400">● TIER 2 ESCALATED</span>
            </div>
            <div className="p-4 border border-white/10 bg-white/[0.01] rounded-2xl font-mono text-[10px] space-y-1 min-w-[130px]">
              <span className="text-brand-gray-550 block">RISK ALERTS</span>
              <span className="text-lg font-bold text-white block">0</span>
              <span className="text-[8px] text-emerald-400">● STABLE STATE</span>
            </div>
          </div>
        </div>

        {/* Console layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main workspace selector & list (Left) */}
          <div className="lg:col-span-8 border border-white/10 bg-white/[0.01] rounded-2xl backdrop-blur-md overflow-hidden text-left">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-white/10 bg-black/60 font-mono text-xs">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-4 px-6 border-r border-white/10 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'tickets' 
                    ? 'bg-white/[0.03] text-white font-semibold' 
                    : 'text-brand-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Support Ticket Queue ({tickets.length})
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 border-r border-white/10 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'orders' 
                    ? 'bg-white/[0.03] text-white font-semibold' 
                    : 'text-brand-gray-400 hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                Orders Marketplace Log ({orders.length})
              </button>
            </div>

            {/* Content Lists */}
            <div className="p-6">
              
              {/* TICKETS LIST */}
              {activeTab === 'tickets' && (
                <div className="space-y-3 font-mono text-[11px]">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 border rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left ${
                        selectedTicket?.id === t.id
                          ? 'border-white bg-white/[0.02]'
                          : 'border-white/5 bg-black/60 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{t.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 border rounded-full ${
                            t.diag.frustration === 'High' 
                              ? 'border-red-500/30 text-red-400 bg-red-500/[0.02]' 
                              : 'border-white/20 text-brand-gray-300'
                          }`}>
                            Mood: {t.diag.frustration}
                          </span>
                        </div>
                        <p className="text-brand-gray-300 font-light text-xs">{t.issue}</p>
                        <span className="text-brand-gray-500 text-[10px] block">Customer: {t.customer} | {t.phone}</span>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-brand-gray-500 text-[10px] block">{t.time}</span>
                        <span className="text-emerald-400 text-[9px] block mt-0.5">● Escalated by AI</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ORDERS LIST */}
              {activeTab === 'orders' && (
                <div className="space-y-3 font-mono text-[11px]">
                  {orders.map((o) => (
                    <div key={o.id} className="p-4 border border-white/5 bg-black/60 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{o.id}</span>
                          <span className="text-brand-gray-300 text-[10px]">{o.item}</span>
                        </div>
                        <span className="text-brand-gray-500 text-[10px] block">Buyer: {o.customer}</span>
                      </div>
                      
                      <div className="text-right shrink-0 font-bold text-white">
                        <span>${o.amount.toFixed(2)}</span>
                        <span className="text-emerald-400 text-[8px] block font-light mt-0.5">✓ COMPLETED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* Action sidebar overrides (Right) */}
          <div className="lg:col-span-4 border border-white/10 bg-white/[0.01] rounded-2xl p-6 text-left space-y-6 backdrop-blur-md">
            
            {/* Selected Ticket Action Panel */}
            {activeTab === 'tickets' && selectedTicket ? (
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] text-brand-gray-550 uppercase">TICKET WORKSPACE</span>
                  <h3 className="font-display text-lg font-bold text-white mt-1">{selectedTicket.id}</h3>
                </div>

                <div className="p-4 border border-white/5 bg-black/80 rounded-xl space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-brand-gray-500">IMEI:</span>
                    <span className="text-white">{selectedTicket.diag.imei}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-500">Timestamp:</span>
                    <span className="text-white">{selectedTicket.diag.timestamp}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <span className="text-brand-gray-500 block mb-1">Attempted diagnostics:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {selectedTicket.diag.stepsTried.map((step, i) => (
                        <span key={i} className="px-1.5 py-0.5 border border-white/10 rounded text-brand-gray-300">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overrides buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAction('sim', selectedTicket.id)}
                    className="w-full py-3.5 font-mono text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve SIM Swap Request
                  </button>
                  <button
                    onClick={() => handleAction('provision', selectedTicket.id)}
                    className="w-full py-3.5 font-mono text-xs border border-white/10 hover:border-white/20 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-transparent"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Manually Reprovision Line
                  </button>
                  <button
                    onClick={() => handleAction('ticket', selectedTicket.id)}
                    className="w-full py-3 text-[11px] font-mono border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl transition-all cursor-pointer"
                  >
                    Resolve Escalation
                  </button>
                </div>
              </div>
            ) : (
              /* DEFAULT SIDEBAR MONITORING WIDGET */
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] text-brand-gray-550 uppercase">SYSTEM DIAGNOSTICS</span>
                  <h3 className="font-display text-lg font-bold text-white mt-1">Network Node Logs</h3>
                </div>

                <div className="p-4 border border-white/5 bg-black/60 rounded-xl space-y-3 font-mono text-[9px] text-left">
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>NODE NYC-MNO-104:</span>
                    <span>ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>DATABASE SYNC:</span>
                    <span>COMPLETED</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>CARRIER ESIM API:</span>
                    <span>READY</span>
                  </div>
                  <div className="flex justify-between items-center text-brand-gray-400">
                    <span>INVENTORY:</span>
                    <span>940 SIM kits left</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] font-mono text-[9px] text-brand-gray-400 leading-relaxed text-left">
                  Click on an open support ticket in the queue list to load diagnostic configurations, check verification parameters, and deploy line-side overrides.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

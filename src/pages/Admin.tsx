import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Ban,
  CircleDollarSign,
  FileText,
  Gauge,
  KeyRound,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Search,
  Users,
  Wifi
} from 'lucide-react';
import {
  billingConfig,
  mockCarrierAdapter,
  wirelessOsService
} from '../services/wirelessOsService';
import { CustomerProfile, WirelessOsState } from '../types/wireless';

type AdminTab = 'overview' | 'customers' | 'waitlist' | 'byop' | 'lifeline' | 'sims' | 'usage' | 'billing' | 'fraud' | 'settings';

interface WaitlistEntry {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  status: string;
  position: number;
  createdAt: string;
}

interface ByopCheck {
  id: string;
  email?: string | null;
  imei_last4?: string | null;
  tac: string;
  detected_brand?: string | null;
  detected_model?: string | null;
  compatibility_status: string;
  manual_review_required: boolean;
  created_at: string;
}

interface LifelineLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  eligibilityStatus: string;
  consent: boolean;
  source: string;
  createdAt: string;
}

const tabs: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'waitlist', label: 'Early Access', icon: Users },
  { id: 'byop', label: 'BYOP Checks', icon: Search },
  { id: 'lifeline', label: 'Lifeline / NTAP', icon: FileText },
  { id: 'sims', label: 'SIM/eSIM', icon: Smartphone },
  { id: 'usage', label: 'Usage', icon: Activity },
  { id: 'billing', label: 'Billing', icon: CircleDollarSign },
  { id: 'fraud', label: 'PackieAI', icon: ShieldAlert },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function StatusPill({ value }: { value: string }) {
  const tone =
    value === 'active' || value === 'enabled' || value === 'likely_compatible'
      ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
      : value === 'suspended' || value === 'high' || value === 'not_supported'
        ? 'bg-red-400/10 text-red-300 border-red-400/20'
        : 'bg-sky-400/10 text-sky-200 border-sky-400/20';

  return (
    <span className={`inline-flex rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider border ${tone}`}>
      {value.replace('_', ' ')}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 min-h-36 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gray-500">{label}</span>
        <Icon className="w-4 h-4 text-cyan-300" />
      </div>
      <div>
        <div className="font-display text-3xl font-semibold text-white">{value}</div>
        <p className="mt-1 text-xs text-brand-gray-400">{detail}</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [state, setState] = useState<WirelessOsState>(() => wirelessOsService.getState());
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState(state.customers[0]?.id || '');
  const [usageGb, setUsageGb] = useState('1.25');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [notice, setNotice] = useState('');
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [byopChecks, setByopChecks] = useState<ByopCheck[]>([]);
  const [byopLoading, setByopLoading] = useState(false);
  const [byopError, setByopError] = useState('');
  const [lifelineLeads, setLifelineLeads] = useState<LifelineLead[]>([]);
  const [lifelineLoading, setLifelineLoading] = useState(false);
  const [lifelineError, setLifelineError] = useState('');

  const refresh = () => {
    const next = wirelessOsService.getState();
    setState(next);
    if (!next.customers.some((customer) => customer.id === selectedCustomerId)) {
      setSelectedCustomerId(next.customers[0]?.id || '');
    }
  };

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('pacmac-wireless-os-change', handler);
    return () => window.removeEventListener('pacmac-wireless-os-change', handler);
  });

  const loadWaitlist = async () => {
    setWaitlistLoading(true);
    setWaitlistError('');
    try {
      const response = await fetch('/api/admin/waitlist', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load waitlist.');
      setWaitlistEntries(data.entries || []);
    } catch (err: any) {
      setWaitlistError(err.message || 'Unable to load waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const loadByopChecks = async () => {
    setByopLoading(true);
    setByopError('');
    try {
      const response = await fetch('/api/admin/byop-checks', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load BYOP checks.');
      setByopChecks(data.checks || []);
    } catch (err: any) {
      setByopError(err.message || 'Unable to load BYOP checks.');
    } finally {
      setByopLoading(false);
    }
  };

  const loadLifelineLeads = async () => {
    setLifelineLoading(true);
    setLifelineError('');
    try {
      const response = await fetch('/api/admin/lifeline-leads', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load Lifeline leads.');
      setLifelineLeads(data.leads || []);
    } catch (err: any) {
      setLifelineError(err.message || 'Unable to load Lifeline leads.');
    } finally {
      setLifelineLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'waitlist') loadWaitlist();
    if (activeTab === 'byop') loadByopChecks();
    if (activeTab === 'lifeline') loadLifelineLeads();
  }, [activeTab]);

  const selectedCustomer = useMemo(
    () => state.customers.find((customer) => customer.id === selectedCustomerId) || state.customers[0],
    [state.customers, selectedCustomerId]
  );

  const metrics = wirelessOsService.getAdminMetrics();

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2500);
  };

  const createCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phoneNumber) return;
    const customer = wirelessOsService.createCustomer(newCustomer);
    setNewCustomer({ name: '', email: '', phoneNumber: '' });
    setSelectedCustomerId(customer.id);
    refresh();
    showNotice('Customer profile created.');
  };

  const provision = (type: 'SIM' | 'eSIM') => {
    if (!selectedCustomer) return;
    mockCarrierAdapter.provisionSim(selectedCustomer, type);
    refresh();
    showNotice(`${type} provisioned through MockCarrierAdapter.`);
  };

  const selectedSim = selectedCustomer
    ? state.sims.find((sim) => sim.customerId === selectedCustomer.id && sim.id === state.lines.find((line) => line.customerId === selectedCustomer.id)?.simId) ||
      state.sims.find((sim) => sim.customerId === selectedCustomer.id)
    : undefined;

  const activate = () => {
    if (!selectedSim) return;
    mockCarrierAdapter.activateSim(selectedSim.id);
    refresh();
    showNotice('Line activated.');
  };

  const suspend = () => {
    if (!selectedSim) return;
    mockCarrierAdapter.suspendSim(selectedSim.id);
    refresh();
    showNotice('Line suspended.');
  };

  const deactivate = () => {
    if (!selectedCustomer) return;
    mockCarrierAdapter.deactivateLine(selectedCustomer.id);
    refresh();
    showNotice('Line deactivated.');
  };

  const simulateUsage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCustomer) return;
    wirelessOsService.simulateUsage(selectedCustomer.id, Number(usageGb));
    refresh();
    showNotice(`${usageGb} GB usage event recorded.`);
  };

  const simulateHighRiskCall = () => {
    if (!selectedCustomer) return;
    wirelessOsService.handleIncomingCall({
      callerNumber: '+1 888 555 0110',
      calledNumber: selectedCustomer.phoneNumber,
      transcriptText: 'urgent payment required by gift card to keep service active',
      timestamp: new Date().toISOString(),
      transcriptUrl: 'https://example.com/mock-transcript.txt'
    });
    refresh();
    showNotice('High-risk PackieAI alert created and blocked.');
  };

  const reset = () => {
    const next = wirelessOsService.resetDemoData();
    setState(next);
    setSelectedCustomerId(next.customers[0]?.id || '');
    showNotice('Demo data restored.');
  };

  const estimateFor = (customer: CustomerProfile) => wirelessOsService.getInvoiceEstimate(customer.id);

  return (
    <div className="relative min-h-screen bg-[#041019] text-white overflow-hidden pb-24 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(18,185,129,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 md:pt-36">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-200">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest">PacMac Mobile Internal</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">PacMac Wireless OS</h1>
            <p className="text-sm text-brand-gray-300 mt-2 max-w-2xl">
              Smarter Wireless. Better Choices. Manage usage billing, SIM lifecycle, mock carrier events, and PackieAI call protection without carrier partner branding.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={reset}
              className="h-10 px-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restore Seeds
            </button>
            <button
              onClick={simulateHighRiskCall}
              className="h-10 px-4 rounded bg-emerald-300 text-[#041019] hover:bg-emerald-200 text-xs font-semibold flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Simulate Scam Call
            </button>
          </div>
        </div>

        {notice && (
          <div className="mb-6 rounded border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-xs font-mono text-emerald-200">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <nav className="lg:sticky lg:top-24 h-max border border-white/8 bg-neutral-950/55 rounded-lg p-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full h-10 px-3 rounded flex items-center gap-2 text-xs font-mono transition-colors ${
                  activeTab === id ? 'bg-white text-[#041019]' : 'text-brand-gray-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          <section className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <MetricCard label="Customers" value={metrics.totalCustomers} detail="registered accounts" icon={Users} />
                  <MetricCard label="Active Lines" value={metrics.activeLines} detail={`${metrics.suspendedLines} suspended`} icon={Wifi} />
                  <MetricCard label="Estimated MRR" value={money(metrics.estimatedMonthlyRevenue)} detail={`${metrics.totalUsageGb} GB this cycle`} icon={CircleDollarSign} />
                  <MetricCard label="PackieAI" value={metrics.highRiskAlerts} detail={`${metrics.blockedNumbers} blocked numbers`} icon={ShieldAlert} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5">
                    <h2 className="font-display text-lg font-semibold mb-4">Data Usage by Customer</h2>
                    <div className="space-y-4">
                      {state.customers.map((customer) => {
                        const estimate = estimateFor(customer);
                        return (
                          <div key={customer.id}>
                            <div className="flex justify-between gap-4 text-xs mb-2">
                              <span>{customer.name}</span>
                              <span className="font-mono text-brand-gray-300">{customer.monthlyDataUsageGb} GB · {money(estimate.estimatedCharge)}</span>
                            </div>
                            <div className="h-2 rounded bg-white/8 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${Math.min(100, estimate.capProgress)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5">
                    <h2 className="font-display text-lg font-semibold mb-4">Recent Carrier & Audit Events</h2>
                    <div className="space-y-3 max-h-80 overflow-auto pr-2">
                      {[...state.carrierEvents, ...state.adminAuditLogs]
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .slice(0, 10)
                        .map((event) => (
                          <div key={event.id} className="border border-white/8 rounded p-3 text-xs">
                            <div className="font-mono text-cyan-200">{'eventType' in event ? event.eventType : event.action}</div>
                            <div className="text-brand-gray-500 mt-1">{new Date(event.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      {state.carrierEvents.length + state.adminAuditLogs.length === 0 && (
                        <p className="text-sm text-brand-gray-400">No events yet. Provision a SIM or simulate usage to populate this stream.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'customers' && (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="border border-white/8 bg-neutral-950/55 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-brand-gray-500 font-mono uppercase tracking-wider border-b border-white/8">
                        <tr>
                          <th className="p-4 font-normal">Customer</th>
                          <th className="p-4 font-normal">Phone</th>
                          <th className="p-4 font-normal">Account</th>
                          <th className="p-4 font-normal">SIM</th>
                          <th className="p-4 font-normal text-right">Estimate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {state.customers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-white/5">
                            <td className="p-4">
                              <button onClick={() => setSelectedCustomerId(customer.id)} className="text-left">
                                <span className="block font-semibold text-white">{customer.name}</span>
                                <span className="block text-brand-gray-400">{customer.email}</span>
                              </button>
                            </td>
                            <td className="p-4 font-mono text-brand-gray-300">{customer.phoneNumber}</td>
                            <td className="p-4"><StatusPill value={customer.accountStatus} /></td>
                            <td className="p-4"><StatusPill value={customer.simStatus} /></td>
                            <td className="p-4 text-right font-mono">{money(estimateFor(customer).estimatedCharge)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <form onSubmit={createCustomer} className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 h-max space-y-4">
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-300" />
                    Create Customer
                  </h2>
                  {(['name', 'email', 'phoneNumber'] as const).map((field) => (
                    <input
                      key={field}
                      value={newCustomer[field]}
                      onChange={(event) => setNewCustomer((current) => ({ ...current, [field]: event.target.value }))}
                      placeholder={field === 'phoneNumber' ? '+1 555 555 0101' : field}
                      className="w-full h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
                    />
                  ))}
                  <button className="w-full h-11 rounded bg-white text-[#041019] text-sm font-semibold hover:bg-cyan-100">Create</button>
                </form>
              </div>
            )}

            {activeTab === 'waitlist' && (
              <div className="border border-white/8 bg-neutral-950/55 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">Early Access Waitlist</h2>
                    <p className="text-sm text-brand-gray-400">
                      Live Supabase signups ordered by created date. Positions are calculated from database order.
                    </p>
                  </div>
                  <button
                    onClick={loadWaitlist}
                    className="h-10 px-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${waitlistLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 border-b border-white/8">
                  <MetricCard label="Total Signups" value={waitlistEntries.length} detail="early access requests" icon={Users} />
                  <MetricCard
                    label="Next Position"
                    value={`#${waitlistEntries.length + 1}`}
                    detail="based on created_at order"
                    icon={Gauge}
                  />
                  <MetricCard
                    label="Latest"
                    value={waitlistEntries[0] ? `#${waitlistEntries[waitlistEntries.length - 1]?.position}` : '-'}
                    detail={waitlistEntries[waitlistEntries.length - 1]?.email || 'no signups yet'}
                    icon={ShieldCheck}
                  />
                </div>

                {waitlistError && (
                  <div className="m-5 rounded border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100">
                    {waitlistError}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-brand-gray-500 font-mono uppercase tracking-wider border-b border-white/8">
                      <tr>
                        <th className="p-4 font-normal">Position</th>
                        <th className="p-4 font-normal">Email</th>
                        <th className="p-4 font-normal">Full Name</th>
                        <th className="p-4 font-normal">Phone</th>
                        <th className="p-4 font-normal">Status</th>
                        <th className="p-4 font-normal">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {waitlistEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/5">
                          <td className="p-4 font-mono text-white">#{entry.position}</td>
                          <td className="p-4 font-mono text-brand-gray-300">{entry.email}</td>
                          <td className="p-4">{entry.fullName || '-'}</td>
                          <td className="p-4 font-mono text-brand-gray-400">{entry.phone || '-'}</td>
                          <td className="p-4"><StatusPill value={entry.status} /></td>
                          <td className="p-4 font-mono text-brand-gray-500">{new Date(entry.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {!waitlistLoading && waitlistEntries.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-brand-gray-500">
                            No early access signups found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'byop' && (
              <div className="border border-white/8 bg-neutral-950/55 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">BYOP Checks</h2>
                    <p className="text-sm text-brand-gray-400">
                      Server-side IMEI lookups. PacMac stores the TAC and IMEI last four only.
                    </p>
                  </div>
                  <button
                    onClick={loadByopChecks}
                    className="h-10 px-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${byopLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 border-b border-white/8">
                  <MetricCard label="Total Checks" value={byopChecks.length} detail="IMEI submissions" icon={Search} />
                  <MetricCard
                    label="Manual Review"
                    value={byopChecks.filter((check) => check.manual_review_required).length}
                    detail="unknown TAC lookups"
                    icon={AlertCircle}
                  />
                  <MetricCard
                    label="Identified"
                    value={byopChecks.filter((check) => check.compatibility_status === 'likely_compatible').length}
                    detail="matched TAC records"
                    icon={ShieldCheck}
                  />
                </div>

                {byopError && (
                  <div className="m-5 rounded border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100">
                    {byopError}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-brand-gray-500 font-mono uppercase tracking-wider border-b border-white/8">
                      <tr>
                        <th className="p-4 font-normal">Created</th>
                        <th className="p-4 font-normal">TAC</th>
                        <th className="p-4 font-normal">IMEI Last 4</th>
                        <th className="p-4 font-normal">Device</th>
                        <th className="p-4 font-normal">Status</th>
                        <th className="p-4 font-normal">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {byopChecks.map((check) => (
                        <tr key={check.id} className="hover:bg-white/5">
                          <td className="p-4 font-mono text-brand-gray-500">{new Date(check.created_at).toLocaleString()}</td>
                          <td className="p-4 font-mono text-white">{check.tac}</td>
                          <td className="p-4 font-mono text-brand-gray-300">{check.imei_last4 ? `...${check.imei_last4}` : '-'}</td>
                          <td className="p-4">
                            {check.detected_brand && check.detected_model ? `${check.detected_brand} ${check.detected_model}` : 'Manual review'}
                          </td>
                          <td className="p-4"><StatusPill value={check.compatibility_status} /></td>
                          <td className="p-4 font-mono text-brand-gray-400">{check.email || '-'}</td>
                        </tr>
                      ))}
                      {!byopLoading && byopChecks.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-brand-gray-500">
                            No BYOP checks found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'lifeline' && (
              <div className="border border-white/8 bg-neutral-950/55 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">Lifeline / NTAP Leads</h2>
                    <p className="text-sm text-brand-gray-400">
                      Safe contact requests from the Nebraska Lifeline helper. No SSNs, documents, or eligibility proof are collected.
                    </p>
                  </div>
                  <button
                    onClick={loadLifelineLeads}
                    className="h-10 px-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${lifelineLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 border-b border-white/8">
                  <MetricCard label="Total Leads" value={lifelineLeads.length} detail="contact requests" icon={FileText} />
                  <MetricCard
                    label="Approved"
                    value={lifelineLeads.filter((lead) => lead.eligibilityStatus === 'I was approved').length}
                    detail="self-reported status"
                    icon={ShieldCheck}
                  />
                  <MetricCard
                    label="Need Help"
                    value={lifelineLeads.filter((lead) => lead.eligibilityStatus === 'I need help finishing').length}
                    detail="follow-up priority"
                    icon={AlertCircle}
                  />
                </div>

                {lifelineError && (
                  <div className="m-5 rounded border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100">
                    {lifelineError}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-brand-gray-500 font-mono uppercase tracking-wider border-b border-white/8">
                      <tr>
                        <th className="p-4 font-normal">Created</th>
                        <th className="p-4 font-normal">Name</th>
                        <th className="p-4 font-normal">Email</th>
                        <th className="p-4 font-normal">Phone</th>
                        <th className="p-4 font-normal">Eligibility Status</th>
                        <th className="p-4 font-normal">Consent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {lifelineLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/5">
                          <td className="p-4 font-mono text-brand-gray-500">{new Date(lead.createdAt).toLocaleString()}</td>
                          <td className="p-4 text-white">{lead.fullName}</td>
                          <td className="p-4 font-mono text-brand-gray-300">{lead.email}</td>
                          <td className="p-4 font-mono text-brand-gray-400">{lead.phone}</td>
                          <td className="p-4"><StatusPill value={lead.eligibilityStatus} /></td>
                          <td className="p-4">{lead.consent ? <StatusPill value="enabled" /> : <StatusPill value="disabled" />}</td>
                        </tr>
                      ))}
                      {!lifelineLoading && lifelineLeads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-brand-gray-500">
                            No Lifeline / NTAP leads found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sims' && selectedCustomer && (
              <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
                <CustomerPicker state={state} selectedCustomerId={selectedCustomer.id} setSelectedCustomerId={setSelectedCustomerId} />
                <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-semibold">{selectedCustomer.name}</h2>
                      <p className="text-sm text-brand-gray-400">{selectedCustomer.phoneNumber}</p>
                    </div>
                    <StatusPill value={selectedCustomer.simStatus} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button onClick={() => provision('eSIM')} className="h-11 rounded border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 text-xs font-mono">Provision eSIM</button>
                    <button onClick={() => provision('SIM')} className="h-11 rounded border border-emerald-300/20 bg-emerald-300/10 text-emerald-100 text-xs font-mono">Assign SIM</button>
                    <button onClick={activate} disabled={!selectedSim} className="h-11 rounded bg-white disabled:opacity-40 text-[#041019] text-xs font-semibold">Activate Line</button>
                    <button onClick={suspend} disabled={!selectedSim} className="h-11 rounded border border-yellow-300/20 bg-yellow-300/10 text-yellow-100 text-xs font-mono">Suspend Line</button>
                    <button onClick={deactivate} className="h-11 rounded border border-red-300/20 bg-red-300/10 text-red-100 text-xs font-mono">Deactivate</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.sims.filter((sim) => sim.customerId === selectedCustomer.id).map((sim) => (
                      <div key={sim.id} className="border border-white/8 rounded p-4 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">{sim.type}</span>
                          <StatusPill value={sim.status} />
                        </div>
                        <div className="font-mono text-brand-gray-400">ICCID {sim.iccid}</div>
                        {sim.eid && <div className="font-mono text-brand-gray-400">EID {sim.eid}</div>}
                        {sim.qrCodeUrl && <div className="font-mono text-cyan-200">QR {sim.qrCodeUrl}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && selectedCustomer && (
              <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
                <CustomerPicker state={state} selectedCustomerId={selectedCustomer.id} setSelectedCustomerId={setSelectedCustomerId} />
                <form onSubmit={simulateUsage} className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 space-y-5">
                  <h2 className="font-display text-xl font-semibold">Usage Simulator</h2>
                  <p className="text-sm text-brand-gray-400">
                    Mock carrier usage events update the customer bill in real time. This is the integration point for a future MVNO, MVNE, or wholesale carrier feed.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                    <input
                      value={usageGb}
                      onChange={(event) => setUsageGb(event.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-12 rounded border border-white/10 bg-[#061723] px-3 outline-none focus:border-cyan-300"
                    />
                    <button className="h-12 px-5 rounded bg-emerald-300 text-[#041019] text-sm font-semibold">Record GB</button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {state.usageEvents
                      .filter((event) => event.customerId === selectedCustomer.id)
                      .map((event) => (
                        <div key={event.id} className="flex justify-between border border-white/8 rounded p-3 text-xs">
                          <span>{event.gbUsed} GB · {event.source}</span>
                          <span className="font-mono text-brand-gray-500">{new Date(event.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="border border-white/8 bg-neutral-950/55 rounded-lg overflow-hidden">
                <div className="p-5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">Dynamic GB Billing</h2>
                    <p className="text-sm text-brand-gray-400">No static plans. Customers pay for data used, capped at {money(billingConfig.monthlyCap)}.</p>
                  </div>
                  <div className="text-xs font-mono text-cyan-200">${billingConfig.pricePerGb}/GB · minimum {billingConfig.minimumChargeEnabled ? money(billingConfig.minimumCharge) : 'disabled'}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-brand-gray-500 font-mono uppercase tracking-wider border-b border-white/8">
                      <tr>
                        <th className="p-4 font-normal">Customer</th>
                        <th className="p-4 font-normal">Usage</th>
                        <th className="p-4 font-normal">Cap Progress</th>
                        <th className="p-4 font-normal text-right">Estimated Bill</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {state.customers.map((customer) => {
                        const estimate = estimateFor(customer);
                        return (
                          <tr key={customer.id}>
                            <td className="p-4">{customer.name}</td>
                            <td className="p-4 font-mono">{estimate.usageGb} GB</td>
                            <td className="p-4">
                              <div className="h-2 w-48 max-w-full rounded bg-white/8 overflow-hidden">
                                <div className="h-full bg-cyan-300" style={{ width: `${estimate.capProgress}%` }} />
                              </div>
                            </td>
                            <td className="p-4 text-right font-mono">{money(estimate.estimatedCharge)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'fraud' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5">
                  <h2 className="font-display text-xl font-semibold mb-4">Fraud Alerts</h2>
                  <div className="space-y-3 max-h-[34rem] overflow-auto pr-2">
                    {state.fraudAlerts.map((alert) => (
                      <div key={alert.id} className="border border-white/8 rounded p-4 text-xs space-y-2">
                        <div className="flex justify-between gap-3">
                          <span className="font-mono">{alert.callerNumber} → {alert.calledNumber}</span>
                          <StatusPill value={alert.riskLevel} />
                        </div>
                        <p className="text-brand-gray-300">{alert.notes}</p>
                        <div className="font-mono text-brand-gray-500">{alert.action} · {new Date(alert.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5">
                  <h2 className="font-display text-xl font-semibold mb-4">Blocked Numbers</h2>
                  <div className="space-y-3">
                    {state.blockedNumbers.map((blocked) => {
                      const owner = state.customers.find((customer) => customer.id === blocked.customerId);
                      return (
                        <div key={blocked.id} className="flex items-center justify-between gap-4 border border-white/8 rounded p-3 text-xs">
                          <div>
                            <div className="font-mono text-red-200">{blocked.phoneNumber}</div>
                            <div className="text-brand-gray-500">{owner?.name} · {blocked.reason}</div>
                          </div>
                          <Ban className="w-4 h-4 text-red-300" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 space-y-4">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2"><KeyRound className="w-4 h-4 text-cyan-300" /> Integration Boundaries</h2>
                  <p className="text-sm text-brand-gray-300">
                    Carrier operations run through MockCarrierAdapter. Replace that adapter with real carrier API calls when PacMac has a signed MVNO, MVNE, or wholesale agreement and documented API contracts.
                  </p>
                  <div className="rounded border border-white/8 bg-[#061723] p-4 text-xs font-mono text-brand-gray-300 space-y-2">
                    <div>provision_sim(customer)</div>
                    <div>activate_sim(sim_id)</div>
                    <div>suspend_sim(sim_id)</div>
                    <div>get_usage(customer_id)</div>
                    <div>get_line_status(phone_number)</div>
                    <div>port_number(customer_id, porting_info)</div>
                    <div>deactivate_line(customer_id)</div>
                  </div>
                </div>
                <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 space-y-4">
                  <h2 className="font-display text-xl font-semibold">Security Basics</h2>
                  {['Role-based admin/customer route separation', 'Admin audit log for staff actions', 'Environment variables for secrets and billing config', 'Stripe-ready invoice estimates with mocked billing events', 'Webhook-ready PackieAI endpoints'].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-brand-gray-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function CustomerPicker({
  state,
  selectedCustomerId,
  setSelectedCustomerId
}: {
  state: WirelessOsState;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
}) {
  return (
    <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-3 h-max">
      {state.customers.map((customer) => (
        <button
          key={customer.id}
          onClick={() => setSelectedCustomerId(customer.id)}
          className={`w-full rounded p-3 text-left transition-colors ${
            selectedCustomerId === customer.id ? 'bg-white text-[#041019]' : 'hover:bg-white/8 text-white'
          }`}
        >
          <span className="block text-sm font-semibold">{customer.name}</span>
          <span className={`block text-xs font-mono ${selectedCustomerId === customer.id ? 'text-[#24404f]' : 'text-brand-gray-500'}`}>
            {customer.phoneNumber}
          </span>
        </button>
      ))}
    </div>
  );
}

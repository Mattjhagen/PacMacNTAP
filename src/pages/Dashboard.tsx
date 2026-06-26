import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  Loader2,
  Lock,
  Phone,
  Plus,
  Radio,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Wifi
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DashboardData {
  customer: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    accountStatus: string;
    simStatus: string;
    fraudProtectionStatus: 'enabled' | 'disabled';
    billingCycle: { id: string; startsAt: string; endsAt: string };
    line: { id: string; phoneNumber: string; status: string; simType: string; iccid: string };
  };
  usageEvents: Array<{ id: string; gbUsed: number; source: string; createdAt: string }>;
  billingEstimate: {
    usageGb: number;
    pricePerGb: number;
    monthlyCap: number;
    estimatedCharge: number;
    capProgress: number;
  };
  fraudAlerts: Array<{
    id: string;
    callerNumber: string;
    riskLevel: 'low' | 'medium' | 'high';
    action: string;
    notes: string;
    createdAt: string;
  }>;
  blockedNumbers: Array<{ id: string; phoneNumber: string; reason: string; createdAt: string }>;
  accountSettings: {
    email: string;
    phoneNumber: string;
    role: string;
    paperlessBilling: boolean;
    autopay: boolean;
  };
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

async function api<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    },
    ...init
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data as T;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [numberToBlock, setNumberToBlock] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api<DashboardData>('/api/customer/dashboard'));
    } catch (err: any) {
      setError(err.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePackie = async () => {
    if (!data) return;
    setActionLoading(true);
    await api('/api/customer/packie-protection', {
      method: 'PATCH',
      body: JSON.stringify({ enabled: data.customer.fraudProtectionStatus !== 'enabled' })
    });
    await load();
    setActionLoading(false);
  };

  const blockNumber = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!numberToBlock.trim()) return;
    setActionLoading(true);
    await api('/api/customer/blocked-numbers', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: numberToBlock.trim() })
    });
    setNumberToBlock('');
    await load();
    setActionLoading(false);
  };

  const unblockNumber = async (id: string) => {
    setActionLoading(true);
    await api(`/api/customer/blocked-numbers/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await load();
    setActionLoading(false);
  };

  const currentUsage = useMemo(() => data?.billingEstimate.usageGb || 0, [data]);

  const logout = async () => {
    await signOut();
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041019] text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-200" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#041019] text-white flex items-center justify-center px-6">
        <div className="max-w-md rounded-lg border border-red-300/20 bg-red-300/10 p-6 text-center">
          <p className="text-sm text-red-100">{error || 'Dashboard unavailable.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#041019] text-white overflow-hidden pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(18,185,129,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 md:pt-36">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-200">
              <Radio className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest">PacMac Mobile</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2">Welcome, {data.customer.name}</h1>
            <p className="text-sm text-brand-gray-300 mt-2">Smarter Wireless. Better Choices.</p>
          </div>
          <button onClick={logout} className="h-10 px-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono">
            Logout
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Metric label="Line Status" value={data.customer.line.status} detail={data.customer.line.phoneNumber} icon={Phone} />
          <Metric label="SIM/eSIM" value={data.customer.simStatus} detail={`${data.customer.line.simType} · ${data.customer.line.iccid}`} icon={Smartphone} />
          <Metric label="Data Used" value={`${currentUsage.toFixed(1)} GB`} detail="this billing cycle" icon={Wifi} />
          <Metric label="Estimated Bill" value={money(data.billingEstimate.estimatedCharge)} detail={`${money(data.billingEstimate.monthlyCap)} cap`} icon={CircleDollarSign} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6 mb-6">
          <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Billing Estimate</h2>
                <p className="text-sm text-brand-gray-400">Usage-based pricing updates as carrier events arrive.</p>
              </div>
              <CalendarDays className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="flex justify-between text-xs font-mono text-brand-gray-400 mb-2">
              <span>{new Date(data.customer.billingCycle.startsAt).toLocaleDateString()}</span>
              <span>{data.billingEstimate.capProgress}% toward cap</span>
              <span>{new Date(data.customer.billingCycle.endsAt).toLocaleDateString()}</span>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                style={{ width: `${data.billingEstimate.capProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-sm">
              <Info label="Rate" value={`${money(data.billingEstimate.pricePerGb)} / GB`} />
              <Info label="Current charge" value={money(data.billingEstimate.estimatedCharge)} />
              <Info label="Monthly cap" value={money(data.billingEstimate.monthlyCap)} />
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-xl font-semibold">PackieAI</h2>
                <p className="text-sm text-brand-gray-400">Fraud-call protection is {data.customer.fraudProtectionStatus}.</p>
              </div>
              {data.customer.fraudProtectionStatus === 'enabled' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              ) : (
                <ShieldOff className="w-5 h-5 text-red-200" />
              )}
            </div>
            <button
              onClick={togglePackie}
              disabled={actionLoading}
              className="w-full h-11 rounded bg-white text-[#041019] text-sm font-semibold disabled:opacity-60"
            >
              {data.customer.fraudProtectionStatus === 'enabled' ? 'Turn Protection Off' : 'Turn Protection On'}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Panel title="Recent Usage Events">
            <div className="space-y-3">
              {data.usageEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded border border-white/8 bg-black/20 p-3 text-sm">
                  <span>{event.gbUsed.toFixed(2)} GB</span>
                  <span className="text-xs font-mono text-brand-gray-500">{new Date(event.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="PackieAI Fraud Alerts">
            <div className="space-y-3">
              {data.fraudAlerts.map((alert) => (
                <div key={alert.id} className="rounded border border-white/8 bg-black/20 p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-mono">{alert.callerNumber}</span>
                    <span className="text-xs uppercase text-cyan-200">{alert.riskLevel}</span>
                  </div>
                  <p className="text-xs text-brand-gray-400 mt-2">{alert.notes}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Blocked Numbers">
            <form onSubmit={blockNumber} className="flex gap-2 mb-4">
              <input
                value={numberToBlock}
                onChange={(event) => setNumberToBlock(event.target.value)}
                placeholder="+1 555 555 0101"
                className="min-w-0 flex-1 h-10 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
              />
              <button disabled={actionLoading} className="h-10 w-10 rounded bg-emerald-300 text-[#041019] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </form>
            <div className="space-y-2">
              {data.blockedNumbers.map((blocked) => (
                <div key={blocked.id} className="flex items-center justify-between gap-3 rounded border border-white/8 bg-black/20 p-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-mono truncate">{blocked.phoneNumber}</div>
                    <div className="text-xs text-brand-gray-500 truncate">{blocked.reason}</div>
                  </div>
                  <button onClick={() => unblockNumber(blocked.id)} className="text-red-200 hover:text-white">
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-neutral-950/60 p-5">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-200" />
            Account Settings Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Info label="Email" value={data.accountSettings.email} />
            <Info label="Phone" value={data.accountSettings.phoneNumber} />
            <Info label="Paperless billing" value={data.accountSettings.paperlessBilling ? 'Enabled' : 'Disabled'} />
            <Info label="Autopay" value={data.accountSettings.autopay ? 'Enabled' : 'Disabled'} />
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: React.ElementType }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-5 min-h-36 flex flex-col justify-between">
      <div className="flex justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gray-500">{label}</span>
        <Icon className="w-4 h-4 text-cyan-200" />
      </div>
      <div>
        <div className="font-display text-2xl font-semibold capitalize truncate">{value}</div>
        <p className="text-xs text-brand-gray-400 mt-1 truncate">{detail}</p>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-5">
      <h2 className="font-display text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/8 bg-black/20 p-3 min-w-0">
      <div className="text-[10px] font-mono uppercase tracking-widest text-brand-gray-500">{label}</div>
      <div className="mt-1 text-sm text-white truncate">{value}</div>
    </div>
  );
}

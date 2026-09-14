import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, RefreshCw } from 'lucide-react';
import { demoFleet, type ConnectedFleet as Fleet } from '../types/connected';

export default function ConnectedFleet({ admin = false }: { admin?: boolean }) {
  const [fleet, setFleet] = useState<Fleet | null>(admin ? null : demoFleet);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(admin);
  const [reload, setReload] = useState(0);
  const [filter, setFilter] = useState('');
  useEffect(() => {
    if (!admin) return;
    const controller = new AbortController();
    setLoading(true); setError(''); setFleet(null);
    fetch('/api/admin/connected/devices', { credentials: 'include', signal: controller.signal })
      .then(async response => {
        if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Fleet service requires the PacMac server. You can still explore the public demo.');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load fleet.');
        if (!['demo', 'live'].includes(data.mode) || !Array.isArray(data.devices)) throw new Error('Unexpected fleet response.');
        setFleet(data);
      }).catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [admin, reload]);
  const devices = fleet?.devices.filter(device => `${device.name} ${device.state}`.toLowerCase().includes(filter.toLowerCase())) || [];
  return <div className="min-h-[80vh] bg-[#071312] px-6 md:px-12 pt-32 pb-24"><div className="max-w-6xl mx-auto">
    <Link to="/connected" className="text-emerald-200 text-sm">← PacMac Connected</Link>
    <div className="flex flex-wrap justify-between items-center gap-5 mt-8"><div><p className="text-emerald-200 font-mono text-xs uppercase tracking-widest">Connected devices</p><h1 className="font-display text-4xl sm:text-5xl mt-3">Your fleet, at a glance.</h1></div>{admin && <button disabled={loading} onClick={() => setReload(n => n + 1)} className="inline-flex items-center gap-2 border border-white/20 rounded-lg p-3 disabled:opacity-50"><RefreshCw size={16} />Refresh</button>}</div>
    {loading && <p role="status" className="mt-8">Loading fleet…</p>}
    {error && <div role="alert" className="mt-8 border border-amber-200/30 bg-amber-200/10 rounded-xl p-5"><p>{error}</p><Link to="/connected/demo" className="inline-block mt-3 underline">Open fleet demo</Link></div>}
    {fleet && <><div className="mt-8 border border-emerald-200/20 bg-emerald-200/5 rounded-xl p-5"><p className="font-semibold">{fleet.mode === 'demo' ? 'Demo fleet · Sample devices only' : 'Live Hologram inventory · Read only'}</p><p className="text-sm text-slate-300 mt-2">{fleet.mode === 'demo' ? 'Explore an example fleet. These devices are fictional; no SIMs are activated and no charges are incurred.' : 'Provider-reported SIM states do not guarantee a device is currently online. Activation and plan changes are managed outside this preview.'}</p></div>
    <div className="flex flex-wrap items-end justify-between gap-5 my-8"><p className="text-slate-300"><strong className="text-white text-3xl mr-2">{fleet.devices.length}</strong>devices loaded</p><label className="text-sm">Filter devices<input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Name or SIM state" className="block mt-2 border border-white/20 bg-black/30 rounded-lg p-3 text-white" /></label></div>
    <div className="grid md:grid-cols-2 gap-4">{devices.map(device => <article key={device.id} className="border border-white/15 rounded-xl p-6 bg-white/[0.025]"><Radio className="text-emerald-200 mb-5" size={24} /><h2 className="font-display text-xl">{device.name}</h2><p className="font-mono text-xs text-slate-300 mt-3 break-words">SIM state · {device.state}</p></article>)}</div>
    {!devices.length && <p role="status" className="py-8 text-slate-300">{fleet.devices.length ? 'No devices match your filter.' : 'No devices found in this organization.'}</p>}
    {fleet.hasMore && <p className="text-amber-200 mt-6">Showing the first 100 devices. Additional inventory is available in the Hologram dashboard.</p>}</>}
  </div></div>;
}

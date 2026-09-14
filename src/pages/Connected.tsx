import { Link } from 'react-router-dom';
import { ArrowUpRight, Navigation, Camera, Tablet, CreditCard, Cpu, Router, Truck, Building2, Radio } from 'lucide-react';

const uses = [
  [Navigation, 'GPS / OBD trackers', 'Keep tabs on assets and vehicle diagnostics with small, regular data updates.'],
  [Camera, 'Security cameras', 'Connect remote cameras and alarm gateways. Video needs a tailored data budget.'],
  [Tablet, 'Tablets & kiosks', 'Bring check-in screens, field tablets, and unattended displays online.'],
  [CreditCard, 'POS & vending', 'Connect payment terminals and vending telemetry beyond fixed broadband.'],
  [Cpu, 'Raspberry Pi / Linux', 'Take your next project into the field with a compatible cellular modem.'],
  [Router, 'Backup LTE / 5G routers', 'Plan a cellular fallback for compatible routers when your primary link drops.'],
  [Truck, 'Fleet telematics', 'Connect vehicle gateways for location, maintenance, and operational data.'],
  [Building2, 'Smart-building equipment', 'Link meters, access systems, and environmental sensor gateways.']
] as const;
export default function Connected() {
  return <div className="relative bg-[#071312] text-white pt-32 pb-24 px-6 md:px-12">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-14 items-center">
        <div>
          <p className="text-emerald-200 text-xs tracking-[0.2em] uppercase font-mono">PacMac Connected · Pilot preview</p>
          <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl leading-[1.05] tracking-tight mt-6">Big ideas.<br /><span className="text-emerald-200">Small SIMs.</span><br />More connected.</h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-xl mt-7">Cellular connectivity for the things that keep your business moving. An IoT offering powered by Hologram, with PacMac helping you plan your deployment.</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/support" className="rounded-lg bg-emerald-200 text-slate-950 px-5 py-3 font-semibold inline-flex gap-3 items-center">Discuss your project <ArrowUpRight size={18} /></Link>
            <Link to="/connected/demo" className="rounded-lg border border-white/25 px-5 py-3 hover:bg-white/10">Explore fleet demo</Link>
          </div>
          <p className="text-xs text-slate-400 mt-5">Sign in to discuss your project with PacMac support. Pilot availability, compatibility, coverage, and pricing confirmed before activation.</p>
        </div>
        <div className="rounded-3xl border border-emerald-200/20 bg-gradient-to-br from-emerald-900/40 to-black p-7 sm:p-10">
          <div className="flex justify-between text-xs font-mono text-emerald-200"><span>ONE CONNECTED WORLD</span><Radio size={20} /></div>
          <div className="grid grid-cols-2 gap-4 my-10">{[[Truck, 'On the move'], [Building2, 'At your site'], [Cpu, 'In the field'], [CreditCard, 'At the counter']].map(([Icon, label]: any) => <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-6"><Icon className="text-emerald-200 mb-5" size={30} /><p className="text-sm">{label}</p></div>)}</div>
          <p className="font-display text-2xl">Your devices. A clearer view.</p><p className="text-sm text-slate-300 mt-3 leading-relaxed">Start with a few devices. Validate your setup. Build a fleet that fits your operation.</p>
        </div>
      </div>
      <section className="mt-24" aria-labelledby="connected-uses"><p className="text-xs text-emerald-200 font-mono uppercase tracking-widest">Built for the world beyond your phone</p><h2 id="connected-uses" className="font-display text-3xl sm:text-4xl mt-3">What will you connect?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">{uses.map(([Icon, title, body]) => <article key={title} className="border border-white/10 rounded-xl p-6 bg-white/[0.025]"><Icon className="text-emerald-200 mb-6" size={26} /><h3 className="text-lg font-semibold">{title}</h3><p className="text-sm leading-relaxed text-slate-300 mt-3">{body}</p></article>)}</div>
      </section>
      <section className="grid md:grid-cols-3 gap-8 border-y border-white/15 py-10 my-20" aria-label="How to get started">{[['01', 'Tell us about your setup', 'Share device models, deployment locations, device count, and expected monthly data.'], ['02', 'Test a small pilot', 'Confirm modem bands, SIM format, local coverage, and real-world data use.'], ['03', 'Plan your rollout', 'Agree on a device-specific quote and operating plan before adding more devices.']].map(([n, title, body]) => <div key={n}><span className="font-mono text-emerald-200">{n}</span><h2 className="font-display text-xl mt-4">{title}</h2><p className="text-sm text-slate-300 mt-3 leading-relaxed">{body}</p></div>)}</section>
      <section className="max-w-3xl"><h2 className="font-display text-3xl mb-6">A plan that fits the device.</h2><div className="space-y-5 text-slate-300 leading-relaxed"><p>Connected uses separate IoT pricing. Consumer wireless rates, monthly caps, Lifeline benefits, and PackieAI phone features do not apply to these devices.</p><p>A tracker sending short updates and a camera streaming video have very different needs. We’ll scope data use and costs with you before a pilot. Continuous video and high-volume router traffic require particular care.</p><p>Devices need compatible cellular hardware. LTE or 5G availability depends on the modem, network, location, and selected Hologram service. Connectivity alone does not provide tracking software, camera storage, or a building-management platform.</p></div></section>
    </div>
  </div>;
}

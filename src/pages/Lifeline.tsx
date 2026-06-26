import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, Check, ExternalLink, FileText, HelpCircle, ShieldCheck } from 'lucide-react';

const nationalVerifierUrl = 'https://www.getinternet.gov/apply?id=nv_home&ln=RW5nbGlzaA%3D%3D';
const nebraskaPscUrl = 'https://psc.nebraska.gov/nebraska-telephone-assistance-programlifeline';

const eligibilityOptions = [
  'Medicaid',
  'SNAP',
  'SSI',
  'Federal Public Housing Assistance',
  'Veterans Pension / Survivors Pension',
  'Income-based qualification',
  'Not sure'
];

const leadStatuses = [
  'I was approved',
  'I was denied',
  'I need help finishing',
  "I'm not sure"
];

export default function Lifeline() {
  const [selectedEligibility, setSelectedEligibility] = useState('Not sure');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    eligibilityStatus: '',
    consent: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitLead = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.consent) {
      setError('Please agree PacMac Mobile may contact you before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/lifeline/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          eligibility_status: form.eligibilityStatus,
          consent: form.consent
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save your request.');
      setMessage('Thanks. PacMac Mobile received your contact request.');
      setForm({ fullName: '', email: '', phone: '', eligibilityStatus: '', consent: false });
    } catch (err: any) {
      setError(err.message || 'Unable to save your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#031018] text-white overflow-hidden pb-24 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.16),transparent_26%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-28 md:pt-40">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 text-emerald-100 text-[10px] font-mono uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Nebraska assistance guide
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
            Nebraska Lifeline / NTAP Assistance
          </h1>
          <p className="mt-5 text-base md:text-lg text-brand-gray-300 leading-relaxed max-w-2xl">
            See if you may qualify for discounted phone service, then verify eligibility through the official National Verifier.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={nationalVerifierUrl}
              target="_blank"
              rel="noreferrer"
              className="h-12 px-5 rounded-lg bg-white text-[#031018] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-cyan-100 transition-colors"
            >
              Verify Eligibility on GetInternet.gov
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={nebraskaPscUrl}
              target="_blank"
              rel="noreferrer"
              className="h-12 px-5 rounded-lg border border-white/10 bg-white/5 text-white font-mono text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              View Nebraska NTAP Details
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.section>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5">
                <h2 className="font-display text-xl font-semibold mb-3">What is NTAP/Lifeline?</h2>
                <p className="text-sm text-brand-gray-300 leading-relaxed">
                  NTAP/Lifeline helps qualifying Nebraska residents lower the cost of monthly phone service.
                </p>
                <p className="mt-4 text-xs text-brand-gray-400 leading-relaxed">
                  Only one Lifeline benefit is allowed per household.
                </p>
              </div>

              <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5">
                <h2 className="font-display text-xl font-semibold mb-3">Possible eligibility programs</h2>
                <div className="grid grid-cols-1 gap-2">
                  {['Medicaid', 'SNAP', 'Supplemental Security Income', 'Federal Public Housing Assistance', 'Veterans Pension or Survivors Pension', 'Household income at or below 135% of federal poverty guidelines'].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-brand-gray-300">
                      <Check className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 space-y-4">
                <div className="w-9 h-9 rounded-lg bg-cyan-300/10 border border-cyan-300/20 flex items-center justify-center text-cyan-100 font-mono text-xs">1</div>
                <h3 className="font-display text-lg font-semibold">Check possible eligibility</h3>
                <div className="space-y-2">
                  {eligibilityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-xs text-brand-gray-300">
                      <input
                        type="radio"
                        name="eligibility"
                        checked={selectedEligibility === option}
                        onChange={() => setSelectedEligibility(option)}
                        className="accent-cyan-300"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 space-y-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center text-emerald-100 font-mono text-xs">2</div>
                <h3 className="font-display text-lg font-semibold">Prepare documents</h3>
                <div className="space-y-3 text-sm text-brand-gray-300">
                  {[
                    'Proof of qualifying program or income',
                    'Identity information',
                    'Address information',
                    'Nebraska may require an NTAP citizenship attestation form'
                  ].map((item) => (
                    <div key={item} className="flex gap-2">
                      <FileText className="w-4 h-4 text-brand-gray-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/8 bg-neutral-950/55 rounded-lg p-5 space-y-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono text-xs">3</div>
                <h3 className="font-display text-lg font-semibold">Verify on official site</h3>
                <p className="text-sm text-brand-gray-300 leading-relaxed">
                  The National Verifier is the official eligibility path. PacMac Mobile can help guide you before or after that step.
                </p>
                <a
                  href={nationalVerifierUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-11 rounded bg-white text-[#031018] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-cyan-100 transition-colors"
                >
                  Verify Eligibility on GetInternet.gov
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="border border-yellow-300/20 bg-yellow-300/10 rounded-lg p-5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-200 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-50/90 leading-relaxed">
                PacMac Mobile can help guide you through the process, but we do not determine eligibility and we are not a government agency. Final eligibility is verified through the official National Verifier. Nebraska NTAP participation may also require additional state forms, including citizenship attestation.
              </p>
            </div>
          </div>

          <aside className="border border-white/8 bg-neutral-950/70 rounded-lg p-5 h-max">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-cyan-200" />
              <h2 className="font-display text-xl font-semibold">Need help after you verify?</h2>
            </div>
            <p className="text-xs text-brand-gray-400 leading-relaxed mb-5">
              Share safe contact info only. Do not send Social Security numbers, benefit cards, documents, or eligibility proof through this form.
            </p>

            <form onSubmit={submitLead} className="space-y-3">
              <input
                required
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Full name"
                className="w-full h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
              />
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
                className="w-full h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
              />
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Phone"
                className="w-full h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
              />
              <select
                required
                value={form.eligibilityStatus}
                onChange={(event) => setForm((current) => ({ ...current, eligibilityStatus: event.target.value }))}
                className="w-full h-11 rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
              >
                <option value="">Eligibility status</option>
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <label className="flex items-start gap-2 text-xs text-brand-gray-300 leading-relaxed">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(event) => setForm((current) => ({ ...current, consent: event.target.checked }))}
                  className="mt-0.5 accent-cyan-300"
                />
                <span>I agree PacMac Mobile may contact me about wireless service options.</span>
              </label>

              {error && <div className="rounded border border-red-300/20 bg-red-300/10 px-3 py-2 text-xs text-red-100">{error}</div>}
              {message && <div className="rounded border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">{message}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded bg-white disabled:opacity-50 text-[#031018] text-sm font-semibold hover:bg-cyan-100 transition-colors"
              >
                {submitting ? 'Saving...' : 'Ask PacMac to follow up'}
              </button>
            </form>
          </aside>
        </section>
      </main>
    </div>
  );
}


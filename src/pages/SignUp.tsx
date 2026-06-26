import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Radio } from 'lucide-react';
import { authService } from '../services/authService';

export default function SignUp() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await authService.signup({
      name: form.name,
      email: form.email,
      password: form.password,
      phoneNumber: form.phoneNumber || undefined
    });
    setLoading(false);

    if (!result.user) {
      setError(result.error || 'Unable to create account.');
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="relative min-h-screen bg-[#041019] text-white overflow-hidden px-4 py-28 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(18,185,129,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.16),transparent_28%)]" />
      <main className="relative z-10 max-w-xl mx-auto border border-white/10 bg-neutral-950/70 rounded-lg p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-lg border border-cyan-300/30 bg-cyan-300/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">Create PacMac account</h1>
            <p className="text-xs text-emerald-200">Smarter Wireless. Better Choices.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name" value={form.name} onChange={(value) => update('name', value)} required />
          <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} required />
          <Field label="Phone number optional" value={form.phoneNumber} onChange={(value) => update('phoneNumber', value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password" type="password" value={form.password} onChange={(value) => update('password', value)} required />
            <Field label="Confirm password" type="password" value={form.confirmPassword} onChange={(value) => update('confirmPassword', value)} required />
          </div>

          {error && (
            <div className="rounded border border-red-300/20 bg-red-300/10 px-3 py-2 text-xs text-red-100">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full h-12 rounded bg-white text-[#041019] font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Create Account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-brand-gray-400">
          Already have an account? <Link to="/signin" className="text-cyan-200 hover:text-white">Sign in</Link>
        </p>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-brand-gray-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 h-12 w-full rounded border border-white/10 bg-[#061723] px-3 text-sm outline-none focus:border-cyan-300"
      />
    </label>
  );
}

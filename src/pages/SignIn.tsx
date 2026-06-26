import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Lock, Mail, Radio, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function SignIn() {
  const [email, setEmail] = useState('customer@pacmacmobile.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const requestedPath = (location.state as any)?.from?.pathname;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);

    if (!result.user) {
      setError(result.error || 'Unable to sign in.');
      return;
    }

    if (requestedPath && result.user.role === 'customer' && requestedPath !== '/admin') {
      navigate(requestedPath, { replace: true });
      return;
    }

    navigate(result.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  const fillDemo = (type: 'customer' | 'admin') => {
    if (type === 'customer') {
      setEmail('customer@pacmacmobile.com');
      setPassword('password123');
    } else {
      setEmail('admin@pacmacmobile.com');
      setPassword('admin123');
    }
    setError('');
  };

  return (
    <div className="relative min-h-screen bg-[#041019] text-white overflow-hidden px-4 py-28 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(18,185,129,0.18),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-center">
        <section>
          <div className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg border border-cyan-300/30 bg-cyan-300/10 flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-5xl font-semibold">PacMac Mobile</h1>
              <p className="text-sm text-emerald-200 mt-1">Smarter Wireless. Better Choices.</p>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-brand-gray-300 leading-relaxed">
            Sign in to manage your wireless line, usage-based billing, SIM/eSIM status, and PackieAI scam-call protection.
          </p>
        </section>

        <section className="border border-white/10 bg-neutral-950/70 rounded-lg p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-200">Secure Access</span>
            <h2 className="font-display text-2xl font-semibold mt-2">Sign in</h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-brand-gray-400">Email</span>
              <span className="mt-2 flex items-center gap-3 rounded border border-white/10 bg-[#061723] px-3">
                <Mail className="w-4 h-4 text-brand-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 flex-1 bg-transparent outline-none text-sm"
                  required
                />
              </span>
            </label>
            <label className="block">
              <span className="text-xs text-brand-gray-400">Password</span>
              <span className="mt-2 flex items-center gap-3 rounded border border-white/10 bg-[#061723] px-3">
                <Lock className="w-4 h-4 text-brand-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 flex-1 bg-transparent outline-none text-sm"
                  required
                />
              </span>
            </label>

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
              Sign In
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-brand-gray-400">
            New to PacMac? <Link to="/signup" className="text-cyan-200 hover:text-white">Create Account</Link>
          </div>

          <div className="mt-6 rounded border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-200 mb-3">
              <ShieldCheck className="w-4 h-4" />
              Demo Credentials
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button type="button" onClick={() => fillDemo('customer')} className="rounded border border-white/10 p-3 text-left hover:bg-white/5">
                <strong className="block text-white">Customer</strong>
                <span className="block text-brand-gray-400 mt-1">customer@pacmacmobile.com</span>
                <span className="block text-brand-gray-500">password123</span>
              </button>
              <button type="button" onClick={() => fillDemo('admin')} className="rounded border border-white/10 p-3 text-left hover:bg-white/5">
                <strong className="block text-white">Admin</strong>
                <span className="block text-brand-gray-400 mt-1">admin@pacmacmobile.com</span>
                <span className="block text-brand-gray-500">admin123</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

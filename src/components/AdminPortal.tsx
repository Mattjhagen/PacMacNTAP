import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RefreshCw, Shield, X } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  status: string;
  position: number;
  createdAt: string;
}

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPortal({ isOpen, onClose }: AdminPortalProps) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/waitlist', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load waitlist.');
      setEntries(data.entries || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load waitlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadEntries();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-5xl max-h-[85vh] bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Early Access Waitlist</h3>
              <p className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-widest">
                Live Supabase Records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadEntries} className="p-2 rounded-lg hover:bg-white/5 text-brand-gray-400 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-brand-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto">
          <div className="mb-4 rounded-xl border border-white/5 bg-neutral-900/30 p-4">
            <span className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-widest block">Total Signups</span>
            <span className="text-3xl font-display font-semibold text-white">{entries.length}</span>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="border border-white/5 rounded-lg overflow-x-auto bg-black">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-neutral-950 text-brand-gray-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-brand-gray-300">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-3 px-4 font-mono text-white">#{entry.position}</td>
                    <td className="py-3 px-4 font-mono">{entry.email}</td>
                    <td className="py-3 px-4">{entry.fullName || '-'}</td>
                    <td className="py-3 px-4 font-mono">{entry.phone || '-'}</td>
                    <td className="py-3 px-4">{entry.status}</td>
                    <td className="py-3 px-4 font-mono text-brand-gray-500">{new Date(entry.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {!loading && entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-brand-gray-500">
                      No early access signups found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence />
    </div>
  );
}

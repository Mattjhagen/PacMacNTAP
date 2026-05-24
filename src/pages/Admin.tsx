import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Download, Trash2, Plus, Users, Search, RefreshCw, Key } from 'lucide-react';
import AuthDiagnostics from '../components/AuthDiagnostics';

interface WaitlistEntry {
  name: string;
  email: string;
  date: string;
  waitlistNumber: number;
  status: string;
}

const DEFAULT_SEED_DATA: WaitlistEntry[] = [
  { name: "Liam Sterling", email: "lsterling@domain.net", date: "2026-05-20T11:42:01Z", waitlistNumber: 2185, status: "Active" },
  { name: "Sophia Vance", email: "sophia.v@cloudspace.io", date: "2026-05-20T08:15:22Z", waitlistNumber: 2204, status: "Active" },
  { name: "Marcus Thorne", email: "mthorne@nexuswire.org", date: "2026-05-19T22:30:11Z", waitlistNumber: 2241, status: "Active" },
  { name: "Elena Rostova", email: "elena.ros@fastmail.com", date: "2026-05-19T17:04:45Z", waitlistNumber: 2289, status: "Active" },
  { name: "Kaito Tanaka", email: "kaito@tanakatech.jp", date: "2026-05-19T11:12:00Z", waitlistNumber: 2311, status: "Active" },
  { name: "Amara Okeke", email: "amara_okeke@globeconnect.ng", date: "2026-05-18T19:50:30Z", waitlistNumber: 2354, status: "Active" },
  { name: "David Miller", email: "d.miller@outlook.com", date: "2026-05-18T14:22:15Z", waitlistNumber: 2410, status: "Active" },
  { name: "Clara Dupont", email: "clara.dupont@orange.fr", date: "2026-05-17T09:35:10Z", waitlistNumber: 2467, status: "Active" }
];

export default function Admin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'waitlist' | 'diagnostics'>('waitlist');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const rawData = localStorage.getItem('pacmac_waitlist_signups');
    if (rawData) {
      try {
        setEntries(JSON.parse(rawData));
      } catch (e) {
        setEntries(DEFAULT_SEED_DATA);
        localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(DEFAULT_SEED_DATA));
      }
    } else {
      setEntries(DEFAULT_SEED_DATA);
      localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(DEFAULT_SEED_DATA));
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      showNotification("❌ No signups to export.");
      return;
    }

    const headers = ["Name", "Email", "Signup Date (UTC)", "Waitlist Number", "Status"];
    const rows = entries.map(item => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${new Date(item.date).toISOString()}"`,
      item.waitlistNumber,
      `"${item.status || 'Active'}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pacmac_waitlist_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("✨ CSV export downloaded successfully!");
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const generatedNum = Math.floor(Math.random() * 450) + 2180;
    const newEntry: WaitlistEntry = {
      name: newName.trim(),
      email: newEmail.trim(),
      date: new Date().toISOString(),
      waitlistNumber: generatedNum,
      status: "Active"
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(updated));
    setNewName("");
    setNewEmail("");
    showNotification("✨ User manually added!");
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    localStorage.removeItem('pacmac_waitlist_signups');
    setEntries([]);
    setConfirmClear(false);
    showNotification("🗑️ Database cleared!");
  };

  const handleRestoreSeeds = () => {
    localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(DEFAULT_SEED_DATA));
    setEntries(DEFAULT_SEED_DATA);
    setConfirmClear(false);
    showNotification("🔄 Seed data restored!");
  };

  const filteredEntries = entries.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.waitlistNumber.toString().includes(searchTerm)
  );

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24 font-sans">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 md:pt-40">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gray-500">
                Internal Ops Console
              </span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white mt-1">
              Developer & Waitlist Manager.
            </h1>
            <p className="mt-1 text-xs text-brand-gray-400 font-mono">
              Direct access to mock account stores and CSV download operations.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-mono border border-white/10 hover:border-white/20 rounded bg-white/5 text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={handleRestoreSeeds}
              className="px-4 py-2 text-xs font-mono border border-white/10 hover:border-white/20 rounded bg-white/5 text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restore Seeds
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-6 border-b border-white/5 pb-4 mb-8 text-xs font-mono">
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`pb-2 border-b-2 uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'waitlist'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-brand-gray-500 hover:text-brand-gray-300'
            }`}
          >
            Waitlist Manager
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`pb-2 border-b-2 uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-brand-gray-500 hover:text-brand-gray-300'
            }`}
          >
            Auth & SMTP Diagnostics
          </button>
        </div>

        {activeTab === 'waitlist' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Waitlist list (Left 8 cols) */}
            <div className="lg:col-span-8 border border-white/5 bg-neutral-950/40 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-gray-500" />
                  Registrations ({filteredEntries.length})
                </h3>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-neutral-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-brand-gray-500">
                      <th className="pb-2 font-normal">Name</th>
                      <th className="pb-2 font-normal">Email</th>
                      <th className="pb-2 font-normal">Position</th>
                      <th className="pb-2 font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredEntries.map((entry, idx) => (
                      <tr key={idx} className="text-brand-gray-300">
                        <td className="py-2.5">{entry.name}</td>
                        <td className="py-2.5 text-brand-gray-400">{entry.email}</td>
                        <td className="py-2.5 font-bold">#{entry.waitlistNumber}</td>
                        <td className="py-2.5 text-right text-green-400">{entry.status}</td>
                      </tr>
                    ))}
                    {filteredEntries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-brand-gray-500 italic">
                          No registrations found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Controls Panel (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Inject Entry */}
              <div className="border border-white/5 bg-neutral-950/40 rounded-xl p-6 space-y-4">
                <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">
                  Inject Record
                </h3>
                <form onSubmit={handleAddUser} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
                  />
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Inject User
                  </button>
                </form>
              </div>

              {/* Clear database */}
              <div className="border border-white/5 bg-neutral-950/40 rounded-xl p-6 space-y-4">
                <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">
                  Destructive Controls
                </h3>
                <button
                  onClick={handleClearAll}
                  className={`w-full py-2 text-xs font-mono font-semibold rounded transition-all flex items-center justify-center gap-1.5 ${
                    confirmClear 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-red-400'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {confirmClear ? "Click again to confirm purge" : "Purge Stored Database"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <AuthDiagnostics />
          </div>
        )}

        {notification && (
          <div className="fixed bottom-6 right-6 bg-neutral-950 border border-white/15 p-4 rounded-lg font-mono text-xs text-white shadow-2xl z-50 animate-bounce">
            {notification}
          </div>
        )}
      </main>
    </div>
  );
}

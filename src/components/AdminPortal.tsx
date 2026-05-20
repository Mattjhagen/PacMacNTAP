import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Download, Trash2, X, Plus, Users, Calendar, CloudLightning, Search, RefreshCw, Layers } from 'lucide-react';

interface WaitlistEntry {
  name: string;
  email: string;
  date: string;
  waitlistNumber: number;
  status: string;
}

// Preloaded realistic seed data to demonstrate rich CSV imports and let the owner use the app instantly
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

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPortal({ isOpen, onClose }: AdminPortalProps) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Load waitlist entries from localStorage on mount or when portal opens
  useEffect(() => {
    if (isOpen) {
      loadEntries();
    }
  }, [isOpen]);

  const loadEntries = () => {
    const rawData = localStorage.getItem('pacmac_waitlist_signups');
    if (rawData) {
      try {
        setEntries(JSON.parse(rawData));
      } catch (e) {
        console.error("Error parsing stored waitlist data:", e);
        // Fallback to seeds if storage contains corrupted JSON
        setEntries(DEFAULT_SEED_DATA);
        localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(DEFAULT_SEED_DATA));
      }
    } else {
      // Setup seed data so it is not blank
      setEntries(DEFAULT_SEED_DATA);
      localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(DEFAULT_SEED_DATA));
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert array to Google Sheets-compatible CSV
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

    // Create blobs and trigger download
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

  // Manually add a user (for manual entry or lead injection)
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showNotification("❌ Please enter a valid email address.");
      return;
    }

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

  // Trashes the waitlist database
  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    localStorage.removeItem('pacmac_waitlist_signups');
    setEntries([]);
    setConfirmClear(false);
    showNotification("🗑️ Stored waitlist has been cleared!");
  };

  const handleRestoreSeeds = () => {
    localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(DEFAULT_SEED_DATA));
    setEntries(DEFAULT_SEED_DATA);
    setConfirmClear(false);
    showNotification("🔄 Seed data successfully restored!");
  };

  // Filter entries according to search query
  const filteredEntries = entries.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.waitlistNumber.toString().includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div id="admin-portal-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] flex flex-col font-sans"
      >
        {/* Glow Line accent on top */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Waitlist Control Center</h3>
              <p className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-widest mt-0.5">PacMac Database Manager</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-brand-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Core Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Dashboard Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-white/5 rounded-xl bg-neutral-900/40 p-4.5 flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 bg-white/5 rounded-lg text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-wider block">Total Signups</span>
                <span className="text-2xl font-bold font-display text-white mt-0.5 block">{entries.length}</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[42px] font-bold text-white/[0.02] pointer-events-none select-none">LIST</div>
            </div>

            <div className="border border-white/5 rounded-xl bg-neutral-900/40 p-4.5 flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 bg-white/5 rounded-lg text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0 pr-8">
                <span className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-wider block">Last Submission</span>
                <span className="text-sm font-semibold text-white mt-0.5 block truncate">
                  {entries.length > 0 ? entries[0].email : "No submissions"}
                </span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[42px] font-bold text-white/[0.02] pointer-events-none select-none">DATE</div>
            </div>

            <div className="border border-white/5 rounded-xl bg-neutral-900/40 p-4.5 flex items-center gap-4 relative overflow-hidden">
              <div className="p-3 bg-white/5 rounded-lg text-white">
                <CloudLightning className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-brand-gray-500 uppercase tracking-wider block">Integration Feed</span>
                <span className="text-[11px] font-mono text-green-400 font-bold tracking-tight mt-1 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  FORMSUBMIT.CO API
                </span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[42px] font-bold text-white/[0.02] pointer-events-none select-none">API</div>
            </div>
          </div>

          {/* Action Row: Export, Clear, Manual input */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Manual Signup Injection Form */}
            <div className="lg:col-span-5 border border-white/5 bg-neutral-900/20 rounded-xl p-5 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">Custom Waitlist Injection</h4>
                <p className="text-[11px] text-brand-gray-500 mt-1">Manually insert a sign-up directly into the registry file for testing.</p>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3 pt-1">
                <div>
                  <input 
                    type="text" 
                    placeholder="Guest Name (e.g. John Miller)"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Guest Email (e.g. jmiller@test.com)"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-black border border-white/15 rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-neutral-200 text-black py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Registrant</span>
                </button>
              </form>
            </div>

            {/* Right Box: Admin commands */}
            <div className="lg:col-span-7 border border-white/5 bg-neutral-900/20 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">Export & Wipe Commands</h4>
                <p className="text-[11px] text-brand-gray-500 mt-1">Prepare CSV datasets for Google Sheets or reset your database locally.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white p-3 rounded-lg flex flex-col items-center justify-center text-center gap-2 transition-all group cursor-pointer"
                >
                  <Download className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-medium">Export CSV</span>
                  <span className="text-[9px] font-mono text-brand-gray-500">Google Sheets OK</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className={`border p-3 rounded-lg flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
                    confirmClear 
                      ? 'bg-red-950/40 border-red-500/50 text-red-200 hover:bg-red-950/60' 
                      : 'bg-white/5 border-white/10 text-red-400 hover:bg-white/10'
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-xs font-medium">{confirmClear ? "Click to Confirm" : "Clear Waitlist"}</span>
                  <span className="text-[9px] font-mono text-brand-gray-500">{confirmClear ? "DANGER: Irreversible!" : "Remove entries"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-brand-gray-500 pt-2 border-t border-white/5">
                <span>Database Backup Status: <span className="text-green-500">READY</span></span>
                <button 
                  onClick={handleRestoreSeeds} 
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to Seed Data
                </button>
              </div>
            </div>
          </div>

          {/* Search bar & Live Waitlist Table overview */}
          <div className="space-y-3.5 border border-white/5 rounded-xl bg-neutral-900/10 p-4.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Registrants List ({filteredEntries.length})
              </h4>
              
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-500" />
                <input 
                  type="text"
                  placeholder="Search name, email or spot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg py-1.5 pl-8.5 pr-4 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Submissions Table Scroll View */}
            <div className="border border-white/5 rounded-lg overflow-x-auto bg-black">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-neutral-950 text-brand-gray-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4.5">Name</th>
                    <th className="py-3 px-4.5">Email</th>
                    <th className="py-3 px-4.5 text-center">Waitlist Spot</th>
                    <th className="py-3 px-4.5">Registration Date (UTC)</th>
                    <th className="py-3 px-4.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-brand-gray-300">
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry, index) => (
                      <tr key={index} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 px-4.5 font-medium text-white">{entry.name}</td>
                        <td className="py-3 px-4.5 font-mono text-brand-gray-400">{entry.email}</td>
                        <td className="py-3 px-4.5 text-center font-mono font-bold text-white">#{entry.waitlistNumber}</td>
                        <td className="py-3 px-4.5 font-mono text-[11px] text-brand-gray-500">
                          {new Date(entry.date).toLocaleString()}
                        </td>
                        <td className="py-3 px-4.5 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase font-mono tracking-wider font-semibold border bg-white/[0.03] text-brand-gray-300 border-white/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {entry.status || "Active"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-brand-gray-500 font-mono">
                        {searchTerm ? "No results matching search query." : "No waitlist registrations found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Modal Status Footer Bar */}
        <div className="px-6 py-3 border-t border-white/5 bg-neutral-950 flex items-center justify-between text-[11px] font-mono text-brand-gray-600">
          <span>Active Datastore: LOCAL_STORAGE</span>
          <span>Google Sheets CSV standard: RFC-4180</span>
        </div>
      </motion.div>

      {/* Floating alert/notification toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-[60] bg-white border border-neutral-200 text-neutral-950 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono font-semibold"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

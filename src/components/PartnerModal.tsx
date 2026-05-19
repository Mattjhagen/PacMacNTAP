import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerModal({ isOpen, onClose }: PartnerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    partnerType: 'Community Programs',
    details: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    // Simulate API registration
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      organization: '',
      email: '',
      partnerType: 'Community Programs',
      details: '',
    });
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="partner-modal-container" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            id="partner-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content Card */}
          <motion.div
            id="partner-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-brand-gray-900 border border-white/10 rounded-2xl p-6 md:p-8 z-10 glow-lg"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brand-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              aria-label="Close partnership modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="font-mono text-xs text-brand-gray-400 tracking-wider uppercase mb-1">
                    Connect / Synergize
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white">
                    Partner with PacMac
                  </h3>
                  <p className="text-sm text-brand-gray-400 mt-2">
                    Let's collaborate to build sustainable wireless solutions and expand connectivity to those who need it most.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="partner-name" className="block text-xs font-mono text-brand-gray-300 uppercase mb-2">
                      Your Name *
                    </label>
                    <input
                      id="partner-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="partner-org" className="block text-xs font-mono text-brand-gray-300 uppercase mb-2">
                        Organization
                      </label>
                      <input
                        id="partner-org"
                        type="text"
                        placeholder="e.g. Community Center"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="partner-email" className="block text-xs font-mono text-brand-gray-300 uppercase mb-2">
                        Email Address *
                      </label>
                      <input
                        id="partner-email"
                        type="email"
                        required
                        placeholder="e.g. alex@rivera.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="partner-type" className="block text-xs font-mono text-brand-gray-300 uppercase mb-2">
                      Partnership Intent
                    </label>
                    <select
                      id="partner-type"
                      value={formData.partnerType}
                      onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors appearance-none"
                    >
                      <option value="Community Programs">Community Connectivity Programs</option>
                      <option value="Municipal Wifi">Municipal / NGO Partnership</option>
                      <option value="Sponsorship">Sponsorship & Donations</option>
                      <option value="Infrastructure">Infrastructure Sharing</option>
                      <option value="Venture / Capital">Investment Inquiry</option>
                      <option value="Other">Other Integration</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="partner-details" className="block text-xs font-mono text-brand-gray-300 uppercase mb-2">
                      Message / Goals
                    </label>
                    <textarea
                      id="partner-details"
                      rows={3}
                      placeholder="Discuss target areas, community goals, or deployment opportunities..."
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 py-2.5 rounded-lg text-sm font-medium tracking-tight text-brand-gray-300 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-white hover:bg-brand-gray-200 text-black py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] disabled:opacity-55"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Submit Proposal'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 bg-white/5 border border-white/15 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-display text-2xl font-bold text-white tracking-tight mb-2">
                  Proposal Submitted
                </h4>
                <p className="text-sm text-brand-gray-400 max-w-sm mx-auto leading-relaxed mb-8">
                  We have successfully cataloged your partnership request. A PacMac Mobile connectivity representative will reach out to you within 24 business hours. Let’s keep wireless human.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white hover:bg-brand-gray-200 text-black px-6 py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all cursor-pointer"
                >
                  Return to Site
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

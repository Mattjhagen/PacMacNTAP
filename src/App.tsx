import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import CursorGlow from './components/CursorGlow';

// Views
import HomeView from './components/HomeView';
import PhoneMarketplaceSection from './components/PhoneMarketplaceSection';
import BYOPSection from './components/BYOPSection';
import ESIMExperienceSection from './components/ESIMExperienceSection';
import AdaptivePlansSection from './components/AdaptivePlansSection';
import AIBillingView from './components/AIBillingView';
import AISupportPreview from './components/AISupportPreview';
import CustomerDashboard from './components/CustomerDashboard';
import CheckoutView from './components/CheckoutView';
import AdminDashboardPreview from './components/AdminDashboardPreview';

export default function App() {
  return (
    <HashRouter>
      <div className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black">
        
        {/* Subtle global noise texture overlay */}
        <div className="noise-overlay" />

        {/* Cyber scanlines overlay for futuristic aesthetic */}
        <div className="scanlines" />

        {/* Custom mouse orb trailing layout cursor follower (auto-disabled on mobile) */}
        <CursorGlow />

        {/* Interactive live physics particle starfield canvas */}
        <ParticleBackground />

        {/* Elegant sticky navigation header */}
        <Navbar />

        {/* Page route view wrapper */}
        <main className="relative z-10">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center font-mono text-xs text-brand-gray-400">
              [ LOADING CARRIER CORE MODULES... ]
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/phones" element={<PhoneMarketplaceSection />} />
              <Route path="/byop" element={<BYOPSection />} />
              <Route path="/esim" element={<ESIMExperienceSection />} />
              <Route path="/plans" element={<AdaptivePlansSection />} />
              <Route path="/ai-billing" element={<AIBillingView />} />
              <Route path="/support" element={<AISupportPreview />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/checkout" element={<CheckoutView />} />
              <Route path="/admin" element={<AdminDashboardPreview />} />
              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Professional local footer */}
        <Footer />

      </div>
    </HashRouter>
  );
}

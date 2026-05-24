import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import CursorGlow from './components/CursorGlow';
import AuthGuard from './components/AuthGuard';

// Page Views
import Home from './pages/Home';
import Phones from './pages/Phones';
import Plans from './pages/Plans';
import BYOP from './pages/BYOP';
import ESIM from './pages/ESIM';
import AIBilling from './pages/AIBilling';
import PackieAI from './pages/PackieAI';
import Support from './pages/Support';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black">
        
        {/* Subtle global noise texture overlay */}
        <div className="noise-overlay" />

        {/* Cyber scanlines overlay for premium aesthetic */}
        <div className="scanlines" />

        {/* Custom mouse orb trailing layout cursor follower (auto-disabled on mobile) */}
        <CursorGlow />

        {/* Interactive live physics particle starfield canvas */}
        <ParticleBackground />

        {/* Elegant sticky navigation header */}
        <Navbar />

        {/* Main Routed Page Content */}
        <main className="relative z-10 min-h-[80vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/phones" element={<Phones />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/byop" element={<BYOP />} />
            <Route path="/esim" element={<ESIM />} />
            <Route path="/ai-billing" element={<AIBilling />} />
            <Route path="/packieai" element={<PackieAI />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } 
            />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Premium footer */}
        <Footer />

      </div>
    </Router>
  );
}

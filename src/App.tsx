import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WhatIsPacMac from './components/WhatIsPacMac';
import ComingSoonSection from './components/ComingSoonSection';
import HowItWorks from './components/HowItWorks';
import LiveActivitySection from './components/LiveActivitySection';
import WaitlistSection from './components/WaitlistSection';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import CursorGlow from './components/CursorGlow';

export default function App() {
  return (
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

      {/* Section hierarchy */}
      <main className="relative z-10">
        
        {/* HERO SECTION - Waveform, rotating slogans */}
        <HeroSection />

        {/* WHAT PACMAC MOBILE IS BUILDING */}
        <WhatIsPacMac />
        
        {/* HOW IT WORKS SECTION - 3D Perspective Tilt Cards */}
        <HowItWorks />
        
        {/* LIVE INTERCEPT SCAM ACTIVITY SECTION - Terminal Stream and stats */}
        <LiveActivitySection />
        
        {/* LAUNCHING SOON SECTION - Dynamic Live Countdown */}
        <ComingSoonSection />
        
        {/* EMAIL WAITLIST SECTION */}
        <WaitlistSection />
        
      </main>


      {/* Professional local footer */}
      <Footer />

    </div>
  );
}

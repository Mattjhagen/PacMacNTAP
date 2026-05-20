import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WhatIsPacMac from './components/WhatIsPacMac';
import PhonesSection from './components/PhonesSection';
import ByopSection from './components/ByopSection';
import EsimSection from './components/EsimSection';
import AdaptivePlansSection from './components/AdaptivePlansSection';
import HowItWorks from './components/HowItWorks';
import LiveActivitySection from './components/LiveActivitySection';
import OperationsPortal from './components/OperationsPortal';
import ComingSoonSection from './components/ComingSoonSection';
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

        {/* 01 // WHAT PACMAC MOBILE IS BUILDING */}
        <WhatIsPacMac />

        {/* 02 // POCKET COMPUTERS & FINANCING */}
        <PhonesSection />

        {/* 03 // BRING YOUR OWN PHONE (BYOP) COMPATIBILITY CHECKER */}
        <ByopSection />

        {/* 04 // eSIM ACTIVATION */}
        <EsimSection />

        {/* 05 // ADAPTIVE AI PLANS & CHAOS ANALYZER */}
        <AdaptivePlansSection />
        
        {/* 06 // HOW IT WORKS SECTION - 3D Perspective Tilt Cards */}
        <HowItWorks />
        
        {/* 07 // LIVE INTERCEPT SCAM ACTIVITY SECTION - Terminal Stream and stats */}
        <LiveActivitySection />

        {/* 08 // OPERATIONS & BILLING DASHBOARD SIMULATOR */}
        <OperationsPortal />
        
        {/* 09 // LAUNCHING SOON SECTION - Dynamic Live Countdown */}
        <ComingSoonSection />
        
        {/* 10 // EMAIL WAITLIST SECTION */}
        <WaitlistSection />
        
      </main>

      {/* Professional local footer */}
      <Footer />

    </div>
  );
}

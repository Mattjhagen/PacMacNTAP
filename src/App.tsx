import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import FutureVisionSection from './components/FutureVisionSection';
import WaitlistSection from './components/WaitlistSection';
import Footer from './components/Footer';
import PartnerModal from './components/PartnerModal';
import ParticleBackground from './components/ParticleBackground';
import CursorGlow from './components/CursorGlow';

export default function App() {
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* 1. Subtle global noise texture overlay */}
      <div className="noise-overlay" />

      {/* 2. Custom mouse orb trailing layout cursor follower (disabled on mobile) */}
      <CursorGlow />

      {/* 3. Interactive live physics particle starfield canvas */}
      <ParticleBackground />

      {/* 4. Elegant sticky navigation header */}
      <Navbar onOpenPartner={() => setIsPartnerOpen(true)} />

      {/* 5. Direct section hierarchy */}
      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <HeroSection onOpenPartner={() => setIsPartnerOpen(true)} />
        
        {/* ABOUT SECTION */}
        <AboutSection />
        
        {/* FEATURES SECTION (3 main cards with interactive bandwidth price estimator) */}
        <FeaturesSection />
        
        {/* FUTURE VISION SECTION (Expandable target local roadmap targets) */}
        <FutureVisionSection />
        
        {/* EMAIL WAITLIST SECTION */}
        <WaitlistSection />
        
      </main>

      {/* 6. Professional local footer */}
      <Footer />

      {/* 7. Dialog Form Portal for Partnership requests */}
      <PartnerModal isOpen={isPartnerOpen} onClose={() => setIsPartnerOpen(false)} />

    </div>
  );
}

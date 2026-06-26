import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import CursorGlow from './components/CursorGlow';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Page Views (Lazy Loaded)
const Home = lazy(() => import('./pages/Home'));
const Phones = lazy(() => import('./pages/Phones'));
const Plans = lazy(() => import('./pages/Plans'));
const BYOP = lazy(() => import('./pages/BYOP'));
const ESIM = lazy(() => import('./pages/ESIM'));
const AIBilling = lazy(() => import('./pages/AIBilling'));
const PackieAI = lazy(() => import('./pages/PackieAI'));
const Support = lazy(() => import('./pages/Support'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));

function PageSuspenseFallback() {
  return (
    <div className="min-h-[70vh] bg-black text-white flex flex-col items-center justify-center font-mono text-xs select-none">
      <div className="flex flex-col items-center gap-3">
        {/* Pulsing telecom signal strength indicator */}
        <div className="flex items-end gap-1 h-5 w-8">
          <div className="w-1 h-1/5 bg-white/20 rounded-t-sm animate-pulse" />
          <div className="w-1 h-2/5 bg-white/35 rounded-t-sm animate-pulse [animation-delay:150ms]" />
          <div className="w-1 h-3/5 bg-white/50 rounded-t-sm animate-pulse [animation-delay:300ms]" />
          <div className="w-1 h-4/5 bg-white/70 rounded-t-sm animate-pulse [animation-delay:450ms]" />
          <div className="w-1 h-full bg-white rounded-t-sm animate-pulse [animation-delay:600ms]" />
        </div>
        <span className="text-[9px] tracking-widest text-brand-gray-500 uppercase">Synchronizing Line...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
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
            <Suspense fallback={<PageSuspenseFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/phones" element={<Phones />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/byop" element={<BYOP />} />
                <Route path="/esim" element={<ESIM />} />
                <Route path="/ai-billing" element={<AIBilling />} />
                <Route path="/packieai" element={<PackieAI />} />
                <Route 
                  path="/support" 
                  element={
                    <ProtectedRoute>
                      <Support />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/login" element={<SignIn />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute role="customer">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute role="customer">
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute role="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                {/* Fallback wildcard to prevent blank-page route failures */}
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </main>

          {/* Premium footer */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}

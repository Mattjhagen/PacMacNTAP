import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black text-white flex flex-col justify-start pt-32 md:pt-40 px-6 max-w-6xl mx-auto overflow-hidden animate-pulse">
        {/* Skeleton Header */}
        <div className="border-b border-white/5 pb-8 mb-12 w-full space-y-3">
          <div className="h-3 w-28 bg-neutral-900 rounded" />
          <div className="h-8 w-64 bg-neutral-800 rounded" />
          <div className="h-4 w-96 bg-neutral-900 rounded" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full mb-8">
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/20 rounded-xl p-8 h-64 flex flex-col justify-between" />
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/20 rounded-xl p-8 h-64 flex flex-col justify-between" />
          <div className="md:col-span-4 border border-white/5 bg-neutral-950/20 rounded-xl p-8 h-64 flex flex-col justify-between" />
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, storing the requested location in state
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

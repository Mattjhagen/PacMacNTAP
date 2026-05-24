import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { authService, UserProfile } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndSession = useCallback(async () => {
    try {
      const isLoggedOut = localStorage.getItem('pacmac_user_logged_out') === 'true';
      if (isLoggedOut) {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session || null;
      setSession(currentSession);

      if (currentSession) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to load session or profile:', err);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('[AuthContext] SignOut error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (currentSession) {
        localStorage.removeItem('pacmac_user_logged_out');
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const handleCustomAuthChange = () => {
      fetchProfileAndSession();
    };

    window.addEventListener('pacmac-auth-change', handleCustomAuthChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('pacmac-auth-change', handleCustomAuthChange);
    };
  }, [fetchProfileAndSession]);

  const value = React.useMemo(() => ({
    user,
    session,
    loading,
    signOut: handleSignOut,
    refreshSession: fetchProfileAndSession
  }), [user, session, loading, handleSignOut, fetchProfileAndSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

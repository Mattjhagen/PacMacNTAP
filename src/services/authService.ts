import { supabase, isLiveDb } from '../utils/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  device?: string;
  status: 'active' | 'pending_activation' | 'suspended';
}

const isBypassActive = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true' && !import.meta.env.PROD;

export const authService = {
  async signInWithOtp(email: string): Promise<{ success: boolean; error: string | null }> {
    if (isBypassActive && !isLiveDb) {
      console.log(`[Dev Auth Bypass] Simulating OTP dispatch to: ${email}`);
      return { success: true, error: null };
    }

    try {
      const redirectUrl = `${window.location.origin}/#/login`;
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      return { success: !error, error: error ? error.message : null };
    } catch (err: any) {
      if (isBypassActive) {
        console.warn(`[Dev Auth Bypass] Supabase failed, falling back to bypass mode:`, err);
        return { success: true, error: null };
      }
      return { success: false, error: err.message || 'OTP request failed.' };
    }
  },

  async verifyOtp(email: string, token: string): Promise<{ session: any; error: string | null }> {
    const emailLower = email.toLowerCase();
    localStorage.removeItem('pacmac_user_logged_out');

    if (isBypassActive && (token === '123456' || token === '1234' || !isLiveDb)) {
      // Simulate successful local session for developer bypass
      const mockSessionData = {
        email: emailLower,
        name: sessionStorage.getItem('pacmac_pending_name') || emailLower.split('@')[0],
        phone: `+1 (510) 555-01${Math.floor(Math.random() * 90 + 10)}`,
        status: 'active',
        simType: 'eSIM',
        device: sessionStorage.getItem('pacmac_pending_device_name') || 'Nothing Phone (2) Dark Edition',
        activationDate: new Date().toISOString().split('T')[0],
        usageData: {
          dataUsedGb: 4.8,
          dataCapGb: 30,
          daysRemaining: 18,
          wifiGb: 19.3,
          cellularGb: 4.8
        },
        savingsThisMonth: 14.20,
        callsBlocked: 9,
        scamTranscripts: []
      };

      localStorage.setItem('pacmac_user_session', JSON.stringify(mockSessionData));
      console.log('[Dev Auth Bypass] Local developer bypass session established.');
      window.dispatchEvent(new Event('pacmac-auth-change'));
      return { session: { user: { email: emailLower, id: 'mock-dev-id' } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email' // Try email verification code first
      });

      let verifyData = data;
      let verifyError = error;

      // Fallback to magiclink verification type if email type fails
      if (verifyError) {
        const { data: mlData, error: mlErr } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'magiclink'
        });
        if (!mlErr) {
          verifyData = mlData;
          verifyError = null;
        }
      }

      if (verifyError) {
        return { session: null, error: verifyError.message };
      }

      // Provision profile if it's a cloud account and doesn't exist
      if (verifyData.user) {
        const pendingName = sessionStorage.getItem('pacmac_pending_name') || emailLower.split('@')[0];
        const pendingSim = sessionStorage.getItem('pacmac_pending_sim') || 'eSIM';
        const pendingDeviceName = sessionStorage.getItem('pacmac_pending_device_name') || 'Unlocked Phone';
        
        const { data: profile } = await supabase
          .from('profiles')
          .select()
          .eq('id', verifyData.user.id)
          .single();

        if (!profile) {
          // Create initial profile record
          await supabase.from('profiles').insert({
            id: verifyData.user.id,
            name: pendingName,
            phone: `+1 (510) 555-01${Math.floor(Math.random() * 90 + 10)}`,
            device: pendingDeviceName,
            status: pendingSim === 'eSIM' ? 'pending_activation' : 'active'
          });
        }

        // Link any pending devices checked during onboarding to this profile
        const pendingDeviceId = sessionStorage.getItem('pacmac_pending_device_id');
        if (pendingDeviceId) {
          try {
            await supabase
              .from('devices')
              .update({ profile_id: verifyData.user.id })
              .eq('id', pendingDeviceId);
            sessionStorage.removeItem('pacmac_pending_device_id');
          } catch (e) {
            console.warn('[Supabase Auth] Failed to link device to user profile:', e);
          }
        }
      }

      window.dispatchEvent(new Event('pacmac-auth-change'));
      return { session: verifyData.session, error: null };
    } catch (err: any) {
      return { session: null, error: err.message || 'OTP verification failed.' };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    localStorage.setItem('pacmac_user_logged_out', 'true');
    localStorage.removeItem('pacmac_user_session');
    const { error } = await supabase.auth.signOut();
    window.dispatchEvent(new Event('pacmac-auth-change'));
    return { error: error ? error.message : null };
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    if (isBypassActive && !isLiveDb) {
      const raw = localStorage.getItem('pacmac_user_session');
      if (raw) {
        const u = JSON.parse(raw);
        return {
          id: 'mock-dev-id',
          email: u.email,
          name: u.name,
          phone: u.phone,
          device: u.device,
          status: u.status
        };
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Fallback to local session check in bypass mode
        if (isBypassActive) {
          const raw = localStorage.getItem('pacmac_user_session');
          if (raw) {
            const u = JSON.parse(raw);
            return {
              id: 'mock-dev-id',
              email: u.email,
              name: u.name,
              phone: u.phone,
              device: u.device,
              status: u.status
            };
          }
        }
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('id', session.user.id)
        .single();

      if (!profile) return null;

      return {
        id: session.user.id,
        email: session.user.email || '',
        name: profile.name,
        phone: profile.phone,
        device: profile.device,
        status: profile.status as any
      };
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  customerId?: string;
  phone?: string;
  device?: string;
  status: 'active' | 'pending_activation' | 'suspended' | 'deactivated';
}

async function readJson<T>(response: Response): Promise<T & { error?: string }> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

function normalizeUser(user: any): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    customerId: user.customerId,
    status: user.status || 'active'
  };
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const data = await readJson<{ user: UserProfile }>(await awaitFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }));
      window.dispatchEvent(new Event('pacmac-auth-change'));
      return { user: normalizeUser(data.user), error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Unable to sign in.' };
    }
  },

  async signup(input: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const data = await readJson<{ user: UserProfile }>(await awaitFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(input)
      }));
      window.dispatchEvent(new Event('pacmac-auth-change'));
      return { user: normalizeUser(data.user), error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Unable to create account.' };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      await awaitFetch('/api/auth/logout', { method: 'POST' });
      window.dispatchEvent(new Event('pacmac-auth-change'));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Unable to sign out.' };
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const data = await readJson<{ user: UserProfile | null }>(await awaitFetch('/api/auth/me'));
      return data.user ? normalizeUser(data.user) : null;
    } catch {
      return null;
    }
  },

  async signInWithOtp(email: string): Promise<{ success: boolean; error: string | null }> {
    return { success: false, error: `Password sign-in is required for ${email}.` };
  },

  async verifyOtp(): Promise<{ session: any; error: string | null }> {
    return { session: null, error: 'Password sign-in is required.' };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const handler = async () => {
      const user = await authService.getCurrentUser();
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
    };
    window.addEventListener('pacmac-auth-change', handler);
    handler();
    return {
      data: {
        subscription: {
          unsubscribe: () => window.removeEventListener('pacmac-auth-change', handler)
        }
      }
    };
  }
};

function awaitFetch(path: string, init: RequestInit = {}) {
  return fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    },
    ...init
  });
}

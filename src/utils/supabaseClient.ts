// Supabase Dual-Mode Client Wrapper
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Detect production / live cloud keys
const isLiveDb = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

// Mock Auth Class for Local Emulator Mode
class MockAuth {
  private listeners: Set<(event: string, session: any) => void> = new Set();
  
  constructor() {
    // Setup initial session in storage if missing
    if (!localStorage.getItem('pacmac_user_session')) {
      const defaultUser = {
        email: 'demo@pacmac.com',
        name: 'Alex Mercer',
        phone: '+1 (510) 555-0198',
        status: 'active',
        simType: 'eSIM',
        device: 'Nothing Phone (2) Dark Edition',
        activationDate: '2026-04-12',
        usageData: {
          dataUsedGb: 8.4,
          dataCapGb: 30,
          daysRemaining: 12,
          wifiGb: 42.1,
          cellularGb: 8.4
        },
        savingsThisMonth: 18.50,
        callsBlocked: 27,
        scamTranscripts: [
          {
            id: "scam-1",
            caller: "+1 (800) 829-1040 (IRS Agent)",
            timestamp: "Today, 10:24 AM",
            type: "IRS Tax Fraud Impersonator",
            dialog: [
              { speaker: "scammer", text: "Hello, this is Agent Williams calling from the Internal Revenue Service regarding an urgent matter of tax evasion..." },
              { speaker: "packie", text: "Hi Agent Williams. I'm screening this call on behalf of the subscriber. Please state the case file identifier for verification." },
              { speaker: "scammer", text: "Yes, the case number is TX-99218. Your client must resolve this debt immediately or local authorities will be dispatched..." },
              { speaker: "packie", text: "That ID format does not match official agency records, and the IRS does not solicit immediate wire transfers. I'm recording this transcript. Goodbye." }
            ]
          }
        ]
      };
      localStorage.setItem('pacmac_user_session', JSON.stringify(defaultUser));
    }
  }

  async getSession() {
    const raw = localStorage.getItem('pacmac_user_session');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        return { data: { session: { user: { email: session.email, user_metadata: { name: session.name } } } }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    }
    return { data: { session: null }, error: null };
  }

  async signInWithOtp(params: { email: string }) {
    // Emulate sending code
    return { data: { message: "OTP sent" }, error: null };
  }

  async verifyOtp(params: { email: string; token: string; type: 'magiclink' | 'signup' | 'sms' }) {
    let sessionData = null;
    const emailLower = params.email.toLowerCase();

    if (emailLower === 'demo@pacmac.com') {
      const raw = localStorage.getItem('pacmac_user_session');
      if (raw) sessionData = JSON.parse(raw);
    }

    if (!sessionData) {
      sessionData = {
        email: emailLower,
        name: emailLower.split('@')[0],
        phone: `+1 (510) 555-01${Math.floor(Math.random() * 90 + 10)}`,
        status: 'active',
        simType: 'eSIM',
        device: 'Nothing Phone (2) Dark Edition',
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
      localStorage.setItem('pacmac_user_session', JSON.stringify(sessionData));
    }

    const payload = { user: { email: sessionData.email, user_metadata: { name: sessionData.name } } };
    this.listeners.forEach(cb => cb('SIGNED_IN', payload));
    return { data: { session: payload, user: payload.user }, error: null };
  }

  async signOut() {
    localStorage.removeItem('pacmac_user_session');
    this.listeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.add(callback);
    this.getSession().then(({ data }) => {
      if (data.session) {
        callback('SIGNED_IN', data.session);
      } else {
        callback('SIGNED_OUT', null);
      }
    });
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          }
        }
      }
    };
  }
}

// Mock Query Builder for Tables
class MockQueryBuilder {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async select() {
    if (this.tableName === 'profiles') {
      const raw = localStorage.getItem('pacmac_user_session');
      if (raw) {
        const u = JSON.parse(raw);
        return { data: [{ id: 'mock-uuid', name: u.name, phone: u.phone, device: u.device, status: u.status }], error: null };
      }
    }
    
    if (this.tableName === 'waitlist') {
      const raw = localStorage.getItem('pacmac_waitlist_signups') || '[]';
      return { data: JSON.parse(raw), error: null };
    }

    return { data: [], error: null };
  }

  insert(data: any) {
    if (this.tableName === 'waitlist') {
      const raw = localStorage.getItem('pacmac_waitlist_signups') || '[]';
      const arr = JSON.parse(raw);
      const payload = Array.isArray(data) ? data : [data];
      const updated = [...payload, ...arr];
      localStorage.setItem('pacmac_waitlist_signups', JSON.stringify(updated));
      return {
        then: (resolve: any) => resolve({ data: payload, error: null }),
        catch: (reject: any) => reject(null)
      };
    }

    return {
      then: (resolve: any) => resolve({ data: data, error: null }),
      catch: (reject: any) => reject(null)
    };
  }

  update(data: any) {
    const raw = localStorage.getItem('pacmac_user_session');
    if (raw) {
      const session = JSON.parse(raw);
      const updated = { ...session, ...data };
      localStorage.setItem('pacmac_user_session', JSON.stringify(updated));
    }
    return {
      eq: (col: string, val: any) => ({
        then: (resolve: any) => resolve({ data: [data], error: null }),
        catch: (reject: any) => reject(null)
      })
    };
  }

  eq(col: string, val: any) {
    return this;
  }

  single() {
    return {
      then: (resolve: any) => {
        this.select().then(res => {
          resolve({ data: res.data?.[0] || null, error: res.error });
        });
      }
    };
  }
}

// Emulated client shape
const mockSupabase = {
  auth: new MockAuth(),
  from: (table: string) => new MockQueryBuilder(table)
};

export const supabase = isLiveDb 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (mockSupabase as any);

console.log(`[PacMac DB Initialization] Operating in: ${isLiveDb ? 'CLOUD_PRODUCTION (Supabase)' : 'LOCAL_EMULATION (LocalStorage)'}`);
export { isLiveDb };

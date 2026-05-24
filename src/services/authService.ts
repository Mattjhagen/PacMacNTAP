import { supabase } from '../utils/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  device?: string;
  status: 'active' | 'pending_activation' | 'suspended';
}

export const authService = {
  async signInWithOtp(email: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { success: !error, error: error ? error.message : null };
  },

  async verifyOtp(email: string, token: string): Promise<{ session: any; error: string | null }> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'magiclink'
    });

    if (error) {
      return { session: null, error: error.message };
    }

    // Provision profile if it's a cloud account and doesn't exist
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Create initial profile record
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: email.split('@')[0],
          phone: `+1 (510) 555-01${Math.floor(Math.random() * 90 + 10)}`,
          status: 'active'
        });
      }
    }

    return { session: data.session, error: null };
  },

  async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

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
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

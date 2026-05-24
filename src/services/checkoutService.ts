import { supabase } from '../utils/supabaseClient';
import { clearCart } from '../utils/storage';

export const checkoutService = {
  async processCheckout(
    email: string,
    name: string,
    address: string,
    cartItems: any[],
    simType: 'eSIM' | 'Physical SIM',
    chosenDevice: string
  ): Promise<{ success: boolean; error: string | null }> {
    return new Promise((resolve) => {
      // Simulate backend checkout transaction and APN registration
      setTimeout(async () => {
        const emailLower = email.toLowerCase();
        
        // Emulate writing new session profile
        const newSession = {
          email: emailLower,
          name: name,
          phone: `+1 (510) 555-01${Math.floor(Math.random() * 90 + 10)}`,
          status: simType === 'eSIM' ? 'pending_activation' : 'active',
          simType: simType,
          device: chosenDevice || 'Unlocked Phone (BYOP)',
          activationDate: new Date().toISOString().split('T')[0],
          usageData: {
            dataUsedGb: 0.0,
            dataCapGb: 30,
            daysRemaining: 30,
            wifiGb: 0.0,
            cellularGb: 0.0
          },
          savingsThisMonth: 0.0,
          callsBlocked: 0,
          scamTranscripts: []
        };

        // Write to localstorage so the emulator finds it
        localStorage.setItem('pacmac_user_session', JSON.stringify(newSession));
        
        // Clear active cart items
        clearCart();
        
        resolve({ success: true, error: null });
      }, 4500); // Realistic transaction latency
    });
  }
};

import { supabase, isLiveDb } from '../utils/supabaseClient';
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
    const emailLower = email.toLowerCase();
    const cleanImei = sessionStorage.getItem('pacmac_checkout_imei') || '';
    const onboardingResultRaw = sessionStorage.getItem('pacmac_onboarding_device_result');
    let onboardingResult: any = null;

    if (onboardingResultRaw) {
      try {
        onboardingResult = JSON.parse(onboardingResultRaw);
      } catch {
        onboardingResult = null;
      }
    }

    if (isLiveDb) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { success: false, error: "No authenticated session found. Please sign in." };
        }

        // Update profile record for this authenticated user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name,
            device: chosenDevice,
            status: simType === 'eSIM' ? 'pending_activation' : 'active'
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Log device compatibility check linked to user profile
        if (onboardingResult) {
          try {
            await supabase
              .from('devices')
              .insert({
                profile_id: user.id,
                imei: onboardingResult.imei,
                brand: onboardingResult.brand,
                model: onboardingResult.model,
                compatibility_status: onboardingResult.compatibility_status,
                sim_type: onboardingResult.sim_type,
                is_esim_capable: onboardingResult.is_esim_capable,
                activation_readiness: onboardingResult.activation_readiness
              });
          } catch (e) {
            console.warn('[Supabase Checkout] Failed to log device compatibility:', e);
          }
        }

        clearCart();
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err.message || 'Supabase authentication failed.' };
      }

    } else {
      // LOCAL_EMULATION (LocalStorage fallback)
      return new Promise((resolve) => {
        setTimeout(() => {
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

          localStorage.setItem('pacmac_user_session', JSON.stringify(newSession));
          
          // Log device
          if (onboardingResult) {
            const rawDevs = localStorage.getItem('pacmac_user_devices') || '[]';
            const devs = JSON.parse(rawDevs);
            devs.push({
              id: `mock-dev-${Date.now()}`,
              imei: onboardingResult.imei,
              brand: onboardingResult.brand,
              model: onboardingResult.model,
              compatibility_status: onboardingResult.compatibility_status,
              sim_type: onboardingResult.sim_type,
              is_esim_capable: onboardingResult.is_esim_capable,
              activation_readiness: onboardingResult.activation_readiness
            });
            localStorage.setItem('pacmac_user_devices', JSON.stringify(devs));
          }

          clearCart();
          resolve({ success: true, error: null });
        }, 1500);
      });
    }
  }
};

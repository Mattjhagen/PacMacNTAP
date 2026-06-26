export type CompatibilityStatus = 'likely_compatible' | 'needs_manual_review' | 'not_supported';

export interface ByopDevice {
  brand: string;
  model: string;
  device_type: string;
  esim_capable: boolean | null;
  five_g_capable: boolean | null;
}

export interface CompatibilityResult {
  success: boolean;
  imei_valid: boolean;
  tac?: string;
  device: ByopDevice | null;
  compatibility_status?: CompatibilityStatus;
  message: string;
}

export const compatibilityService = {
  validateImei(imei: string): boolean {
    const cleanImei = imei.replace(/\D/g, '');
    if (!/^\d{15}$/.test(cleanImei)) return false;

    let sum = 0;
    for (let i = 0; i < cleanImei.length; i += 1) {
      let digit = Number(cleanImei[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    return sum % 10 === 0;
  },

  async checkCompatibility(imei: string): Promise<CompatibilityResult> {
    const response = await fetch('/api/byop/check-imei', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imei })
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        imei_valid: Boolean(data.imei_valid),
        device: null,
        message: data.message || data.error || 'Please enter a valid 15-digit IMEI.'
      };
    }

    return data;
  }
};

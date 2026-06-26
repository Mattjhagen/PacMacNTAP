import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type CompatibilityStatus = 'likely_compatible' | 'needs_manual_review' | 'not_supported';

export interface TacDeviceRecord {
  tac: string;
  brand: string;
  model: string;
  device_type: string;
  esim_capable: boolean | null;
  five_g_capable: boolean | null;
  source: string;
}

export interface ByopCompatibilityResult {
  imei_valid: boolean;
  tac?: string;
  brand?: string;
  model?: string;
  device_type?: string;
  esim_capable?: boolean | null;
  five_g_capable?: boolean | null;
  compatibility_status?: CompatibilityStatus;
  source?: string;
  message?: string;
}

export interface ImeiLookupProvider {
  lookup(imei: string): Promise<TacDeviceRecord | null>;
}

let supabaseAdmin: SupabaseClient | null | undefined;

function getSupabaseAdmin() {
  if (supabaseAdmin !== undefined) return supabaseAdmin;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasValidUrl = Boolean(url && /^https?:\/\//i.test(url));
  supabaseAdmin = hasValidUrl && key ? createClient(url!, key, { auth: { persistSession: false } }) : null;
  return supabaseAdmin;
}

export const localTacDatabase: TacDeviceRecord[] = [
  {
    tac: '35304110',
    brand: 'Apple',
    model: 'iPhone 14',
    device_type: 'smartphone',
    esim_capable: true,
    five_g_capable: true,
    source: 'local_tac_database'
  },
  {
    tac: '35693835',
    brand: 'Apple',
    model: 'iPhone 13',
    device_type: 'smartphone',
    esim_capable: true,
    five_g_capable: true,
    source: 'local_tac_database'
  },
  {
    tac: '35925406',
    brand: 'Samsung',
    model: 'Galaxy S23',
    device_type: 'smartphone',
    esim_capable: true,
    five_g_capable: true,
    source: 'local_tac_database'
  },
  {
    tac: '35672511',
    brand: 'Samsung',
    model: 'Galaxy S22',
    device_type: 'smartphone',
    esim_capable: true,
    five_g_capable: true,
    source: 'local_tac_database'
  },
  {
    tac: '35824005',
    brand: 'Google',
    model: 'Pixel 7',
    device_type: 'smartphone',
    esim_capable: true,
    five_g_capable: true,
    source: 'local_tac_database'
  },
  {
    tac: '35850012',
    brand: 'Google',
    model: 'Pixel 8',
    device_type: 'smartphone',
    esim_capable: true,
    five_g_capable: true,
    source: 'local_tac_database'
  },
  {
    tac: '35682811',
    brand: 'Motorola',
    model: 'Moto G Power 5G',
    device_type: 'smartphone',
    esim_capable: false,
    five_g_capable: true,
    source: 'local_tac_database'
  },
  {
    tac: '35766010',
    brand: 'OnePlus',
    model: 'OnePlus 11',
    device_type: 'smartphone',
    esim_capable: true,
    five_g_capable: true,
    source: 'local_tac_database'
  }
];

export class LocalTacLookupProvider implements ImeiLookupProvider {
  async lookup(imei: string) {
    const tac = DeviceLookupService.extract_tac(imei);
    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data, error } = await supabase
        .from('device_tac_database')
        .select('tac,brand,model,device_type,esim_capable,five_g_capable,source')
        .eq('tac', tac)
        .maybeSingle();

      if (!error && data) {
        return {
          tac: data.tac,
          brand: data.brand,
          model: data.model,
          device_type: data.device_type || 'smartphone',
          esim_capable: data.esim_capable,
          five_g_capable: data.five_g_capable,
          source: data.source || 'supabase_tac_database'
        };
      }
    }

    return localTacDatabase.find((record) => record.tac === tac) || null;
  }
}

export class PlaceholderExternalImeiProvider implements ImeiLookupProvider {
  async lookup(_imei: string) {
    return null;
  }
}

export class DeviceLookupService {
  constructor(private provider: ImeiLookupProvider = new LocalTacLookupProvider()) {}

  static validate_imei(imei: string) {
    const clean = imei.replace(/\D/g, '');
    if (!/^\d{15}$/.test(clean)) return false;

    let sum = 0;
    for (let i = 0; i < clean.length; i++) {
      let digit = Number(clean[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }

  static extract_tac(imei: string) {
    return imei.replace(/\D/g, '').slice(0, 8);
  }

  validate_imei(imei: string) {
    return DeviceLookupService.validate_imei(imei);
  }

  extract_tac(imei: string) {
    return DeviceLookupService.extract_tac(imei);
  }

  async lookup_device_by_tac(tac: string) {
    return this.provider.lookup(`${tac}0000000`);
  }

  async check_byop_compatibility(imei: string): Promise<ByopCompatibilityResult> {
    const clean = imei.replace(/\D/g, '');
    if (!DeviceLookupService.validate_imei(clean)) {
      return {
        imei_valid: false,
        message: 'Please enter a valid 15-digit IMEI.'
      };
    }

    const tac = DeviceLookupService.extract_tac(clean);
    const device = await this.provider.lookup(clean);

    if (!device) {
      await this.recordByopCheck(clean, tac, null, 'needs_manual_review');
      return {
        imei_valid: true,
        tac,
        compatibility_status: 'needs_manual_review',
        source: 'local_tac_database',
        message: "We couldn’t automatically identify this device, but your IMEI appears valid."
      };
    }

    await this.recordByopCheck(clean, tac, device, 'likely_compatible');
    return {
      imei_valid: true,
      tac,
      brand: device.brand,
      model: device.model,
      device_type: device.device_type,
      esim_capable: device.esim_capable,
      five_g_capable: device.five_g_capable,
      compatibility_status: 'likely_compatible',
      source: device.source,
      message: 'We found your device.'
    };
  }

  private async recordByopCheck(
    imei: string,
    tac: string,
    device: TacDeviceRecord | null,
    compatibilityStatus: CompatibilityStatus
  ) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    await supabase.from('byop_checks').insert({
      tac,
      imei_last4: imei.slice(-4),
      detected_brand: device?.brand || null,
      detected_model: device?.model || null,
      compatibility_status: compatibilityStatus,
      manual_review_required: compatibilityStatus === 'needs_manual_review'
    }).then(({ error }) => {
      if (error) {
        console.warn('[BYOP] Unable to record TAC lookup check:', error.message);
      }
    });
  }
}

export const deviceLookupService = new DeviceLookupService();

export function formatByopApiResponse(result: ByopCompatibilityResult) {
  if (!result.imei_valid) {
    return {
      success: false,
      imei_valid: false,
      message: result.message || 'Please enter a valid 15-digit IMEI.'
    };
  }

  const device = result.brand && result.model
    ? {
        brand: result.brand,
        model: result.model,
        device_type: result.device_type || 'smartphone',
        esim_capable: result.esim_capable,
        five_g_capable: result.five_g_capable
      }
    : null;

  return {
    success: true,
    imei_valid: true,
    tac: result.tac,
    device,
    compatibility_status: result.compatibility_status,
    message: result.message
  };
}

export async function listByopChecks() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('byop_checks')
    .select('id,email,imei_last4,tac,detected_brand,detected_model,compatibility_status,manual_review_required,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

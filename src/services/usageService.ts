import { supabase } from '../utils/supabaseClient';

export interface UsageReport {
  dataUsedGb: number;
  dataCapGb: number;
  daysRemaining: number;
  wifiGb: number;
  cellularGb: number;
  trends: Array<{ day: string; cellularGb: number; wifiGb: number }>;
}

export const usageService = {
  async getUsageData(userId: string): Promise<UsageReport> {
    // In production: aggregation query over public.usage_logs
    return {
      dataUsedGb: 8.4,
      dataCapGb: 30,
      daysRemaining: 12,
      wifiGb: 42.1,
      cellularGb: 8.4,
      trends: [
        { day: 'Mon', cellularGb: 0.8, wifiGb: 3.2 },
        { day: 'Tue', cellularGb: 1.2, wifiGb: 4.1 },
        { day: 'Wed', cellularGb: 0.5, wifiGb: 2.8 },
        { day: 'Thu', cellularGb: 1.4, wifiGb: 5.5 },
        { day: 'Fri', cellularGb: 2.1, wifiGb: 6.8 },
        { day: 'Sat', cellularGb: 1.6, wifiGb: 11.2 },
        { day: 'Sun', cellularGb: 0.8, wifiGb: 8.5 }
      ]
    };
  }
};

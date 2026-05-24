import { supabase, isLiveDb } from '../utils/supabaseClient';

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
    const daysInMonth = 30;
    const currentDay = new Date().getDate();
    const daysRemaining = Math.max(1, daysInMonth - (currentDay % daysInMonth));

    const defaultTrends = [
      { day: 'Mon', cellularGb: 0.8, wifiGb: 3.2 },
      { day: 'Tue', cellularGb: 1.2, wifiGb: 4.1 },
      { day: 'Wed', cellularGb: 0.5, wifiGb: 2.8 },
      { day: 'Thu', cellularGb: 1.4, wifiGb: 5.5 },
      { day: 'Fri', cellularGb: 2.1, wifiGb: 6.8 },
      { day: 'Sat', cellularGb: 1.6, wifiGb: 11.2 },
      { day: 'Sun', cellularGb: 0.8, wifiGb: 8.5 }
    ];

    if (!isLiveDb) {
      return {
        dataUsedGb: 8.4,
        dataCapGb: 30,
        daysRemaining,
        wifiGb: 42.1,
        cellularGb: 8.4,
        trends: defaultTrends
      };
    }

    try {
      // 1. Fetch usage logs from Supabase
      const { data: logs, error } = await supabase
        .from('usage_logs')
        .select()
        .eq('profile_id', userId)
        .order('recorded_date', { ascending: true });

      if (error) throw error;

      let activeLogs = logs || [];

      // 2. If no logs exist, seed realistic telemetry logs for testing
      if (activeLogs.length === 0) {
        console.log('[usageService] Seeding database telemetry usage logs...');
        const seedLogs = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          
          const trendIndex = 6 - i;
          seedLogs.push({
            profile_id: userId,
            recorded_date: date.toISOString().split('T')[0],
            cellular_gb: defaultTrends[trendIndex].cellularGb,
            wifi_gb: defaultTrends[trendIndex].wifiGb
          });
        }

        const { data: insertedLogs, error: insertErr } = await supabase
          .from('usage_logs')
          .insert(seedLogs)
          .select();

        if (!insertErr && insertedLogs) {
          activeLogs = insertedLogs;
        } else {
          console.warn('[usageService] Seeding failed, using memory fallback:', insertErr);
          activeLogs = seedLogs as any;
        }
      }

      // 3. Aggregate totals and build trends
      let totalCellular = 0;
      let totalWifi = 0;
      const trends = activeLogs.map((log: any) => {
        const cellVal = parseFloat(log.cellular_gb) || 0;
        const wifiVal = parseFloat(log.wifi_gb) || 0;
        totalCellular += cellVal;
        totalWifi += wifiVal;

        // Extract day of week name from date string
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = daysOfWeek[new Date(log.recorded_date + 'T00:00:00').getDay()];

        return {
          day: dayName || 'Day',
          cellularGb: cellVal,
          wifiGb: wifiVal
        };
      });

      return {
        dataUsedGb: parseFloat(totalCellular.toFixed(1)),
        dataCapGb: 30,
        daysRemaining,
        wifiGb: parseFloat(totalWifi.toFixed(1)),
        cellularGb: parseFloat(totalCellular.toFixed(1)),
        trends: trends.slice(-7) // Limit to latest 7 days
      };

    } catch (err) {
      console.warn('[usageService] Database error, falling back to mock telemetry:', err);
      return {
        dataUsedGb: 8.4,
        dataCapGb: 30,
        daysRemaining,
        wifiGb: 42.1,
        cellularGb: 8.4,
        trends: defaultTrends
      };
    }
  }
};

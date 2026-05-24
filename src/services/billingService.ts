import { supabase } from '../utils/supabaseClient';

export interface BillingSummary {
  baseCost: number;
  currentCost: number;
  traditionalCost: number;
  savings: number;
}

export const billingService = {
  calculateAdaptiveRate(gb: number): number {
    if (gb <= 2) return 12;
    if (gb >= 30) return 30;
    const fraction = (gb - 2) / 28;
    return Math.round((12 + fraction * 18) * 100) / 100;
  },

  getSavingsInfo(gb: number): BillingSummary {
    const baseCost = 12;
    const currentCost = this.calculateAdaptiveRate(gb);
    const traditionalCost = 70; // Fixed competitor fee
    const savings = Math.round((traditionalCost - currentCost) * 100) / 100;
    
    return {
      baseCost,
      currentCost,
      traditionalCost,
      savings: Math.max(0, savings)
    };
  },

  async getInvoices(): Promise<any[]> {
    // In real app: fetch from Stripe or db invoices table
    return [
      { id: 'inv-05', date: 'May 1, 2026', amount: 15.80, status: 'paid', usage: '5.9 GB' },
      { id: 'inv-04', date: 'Apr 1, 2026', amount: 12.00, status: 'paid', usage: '1.4 GB' },
      { id: 'inv-03', date: 'Mar 1, 2026', amount: 24.20, status: 'paid', usage: '19.1 GB' }
    ];
  },

  async savePaymentMethod(cardDetails: { number: string; expiry: string }): Promise<{ success: boolean; error: string | null }> {
    // Emulates secure tokens insertion
    return { success: true, error: null };
  }
};

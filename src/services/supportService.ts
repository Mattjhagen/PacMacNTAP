import { supabase } from '../utils/supabaseClient';

export interface BlockedCallLog {
  id: string;
  caller: string;
  timestamp: string;
  type: string;
  dialog: Array<{ speaker: 'scammer' | 'packie'; text: string }>;
}

export const supportService = {
  async getSpamBlockedLogs(): Promise<BlockedCallLog[]> {
    const defaultLogs = [
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
      },
      {
        id: "scam-2",
        caller: "Restricted (Vehicle Warranty)",
        timestamp: "Yesterday, 3:15 PM",
        type: "Auto Warranty Robocall",
        dialog: [
          { speaker: "scammer", text: "We've been trying to reach you concerning your vehicle's manufacturer warranty which is set to expire..." },
          { speaker: "packie", text: "This line is monitored for unsolicited telemarketing. What is the make and model of the vehicle you are calling about?" },
          { speaker: "scammer", text: "...Uh, our database shows a general expiration notification. I need to transfer you to a specialist..." },
          { speaker: "packie", text: "You don't have the vehicle info. Thank you for your time. Hanging up." }
        ]
      }
    ];

    // In a real production setup: query from public.packie_logs
    return defaultLogs;
  },

  async runNetworkDiagnostics(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          "Quizzing local cell tower handshakes...",
          "Validating SIM security credentials...",
          "Measuring signal latency & packet loss...",
          "Flushing on-device routing caches...",
          "Syncing adaptive billing ledger updates...",
          "Diagnostics complete. Network state: Stable."
        ]);
      }, 1000);
    });
  },

  async createTicket(ticket: { type: string; subject: string; details: string }): Promise<{ success: boolean; id: string }> {
    // In production: insert into public.support_tickets
    const generatedId = Math.random().toString(36).substring(7);
    return { success: true, id: generatedId };
  },

  getAIResponse(query: string, name: string = 'there'): string {
    const q = query.toLowerCase();
    
    if (q.includes('signal') || q.includes('refresh') || q.includes('connection')) {
      return "Running regional base station flush pathways. This drops signal for 2 seconds. Tap the 'Refresh Connection' diagnostic button below to initiate.";
    }
    
    if (q.includes('bill') || q.includes('charge') || q.includes('pricing') || q.includes('pay')) {
      return "PacMac billing checks usage hourly and rescales. You pay $12 for base coverage (2GB), then roughly $0.64/GB up to the $30 Unlimited Cap. Unused data margins are kept in your pocket, not ours.";
    }
    
    if (q.includes('esim') || q.includes('activate') || q.includes('qr')) {
      return "Activation takes 3 minutes. Head to /esim, scan the QR profile code, and your mobile APN routing configurations auto-configure.";
    }
    
    if (q.includes('human') || q.includes('agent') || q.includes('support')) {
      return "I can hand this off to our operations center in San Francisco. An engineer will take over this thread directly without scripts. Type 'transfer' to proceed.";
    }
    
    if (q.includes('hello') || q.includes('hi')) {
      return `Hi ${name}. I handle connection resets, bill audits, and eSIM configurations. Let me know what you need.`;
    }
    
    return "I check signal feeds, bill updates, and SIM profiles. Let me know if you need to execute line diagnostics or escalation tickets.";
  }
};

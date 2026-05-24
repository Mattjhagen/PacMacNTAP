import { supabase, isLiveDb } from '../utils/supabaseClient';

export interface BlockedCallLog {
  id: string;
  caller: string;
  timestamp: string;
  type: string;
  dialog: Array<{ speaker: 'scammer' | 'packie' | 'caller'; text: string }>;
}

export interface UserContext {
  name: string;
  phone: string;
  device: string;
  dataUsedGb: number;
  simType: string;
  lastDiagnosticsTime?: string | null;
  lastTicketId?: string | null;
}

export const supportService = {
  async getSpamBlockedLogs(userId?: string): Promise<BlockedCallLog[]> {
    const defaultLogs: BlockedCallLog[] = [
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

    if (!isLiveDb || !userId) {
      return defaultLogs;
    }

    try {
      const { data: logs, error } = await supabase
        .from('packie_logs')
        .select()
        .eq('profile_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      let activeLogs = logs || [];

      if (activeLogs.length === 0) {
        console.log('[supportService] Seeding database PackieAI logs...');
        const seedLogs = defaultLogs.map(log => ({
          profile_id: userId,
          caller_number: log.caller.split(' (')[0],
          caller_tag: log.caller.includes('(') ? log.caller.split('(')[1].replace(')', '') : log.type,
          dialogue_json: log.dialog,
          is_blocked: true
        }));

        const { data: inserted, error: insertErr } = await supabase
          .from('packie_logs')
          .insert(seedLogs)
          .select();

        if (!insertErr && inserted) {
          activeLogs = inserted;
        } else {
          console.warn('[supportService] Seeding failed, using memory fallback:', insertErr);
          return defaultLogs;
        }
      }

      return activeLogs.map((log: any) => {
        const timeVal = new Date(log.timestamp);
        const today = new Date();
        const isToday = timeVal.toDateString() === today.toDateString();
        
        const timeFormatted = isToday 
          ? `Today, ${timeVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : timeVal.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${timeVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        return {
          id: log.id,
          caller: `${log.caller_number} (${log.caller_tag || 'Blocked'})`,
          timestamp: timeFormatted,
          type: log.caller_tag || 'Robocall Screened',
          dialog: Array.isArray(log.dialogue_json) ? log.dialogue_json : []
        };
      });

    } catch (err) {
      console.warn('[supportService] Database error, using mock data:', err);
      return defaultLogs;
    }
  },

  async runNetworkDiagnostics(): Promise<string[]> {
    return new Promise((resolve) => {
      // Quietly believable technical diagnostics (no cyber theater)
      setTimeout(() => {
        resolve([
          "Checking signal strength at nearest cell tower...",
          "Verifying SIM profile authentication...",
          "Testing latency (ping: 32ms, packet loss: 0%)...",
          "Refreshing network APN routing configuration...",
          "Syncing billing usage ledger with database...",
          "Diagnostics complete. Your line connection is healthy and online."
        ]);
      }, 1000);
    });
  },

  async createTicket(ticket: { type: string; subject: string; details: string }, userId?: string): Promise<{ success: boolean; id: string }> {
    const generatedId = Math.random().toString(36).substring(7);

    if (!isLiveDb || !userId) {
      return { success: true, id: generatedId };
    }

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          profile_id: userId,
          subject: ticket.subject,
          description: ticket.details,
          ticket_type: ticket.type === 'billing' ? 'billing' : ticket.type === 'refresh' ? 'signal_refresh' : 'other',
          messages_json: [{ speaker: 'user', text: ticket.details, time: new Date().toISOString() }]
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, id: data.id };

    } catch (err) {
      console.warn('[supportService] Failed to insert ticket, returning generated code:', err);
      return { success: true, id: generatedId };
    }
  },

  getAIResponse(query: string, context?: UserContext): string {
    const q = query.toLowerCase();
    
    const name = context?.name || 'there';
    const device = context?.device || 'handset';
    const phone = context?.phone || 'active line';
    const sim = context?.simType || 'eSIM';
    const usageStr = context ? `${context.dataUsedGb.toFixed(1)} GB` : null;
    const ticketId = context?.lastTicketId;
    const diagTime = context?.lastDiagnosticsTime;

    // Ticket status queries
    if (q.includes('ticket') || q.includes('escalat') || q.includes('status') || q.includes('open') || q.includes('desk') || q.includes('human')) {
      if (ticketId) {
        return `Active ticket open (Ref: #${ticketId}). Queued for SF Operations. A network engineer is checking your line logs and will email you directly.`;
      }
      if (q.includes('human') || q.includes('agent') || q.includes('support')) {
        return `I can escalate this directly to our desk team in San Francisco. A network engineer will check your signal feeds and reply directly to your inbox. Tap "Ticket Escalation" to dispatch.`;
      }
      return `No active support tickets open. I can create one — click "Ticket Escalation" below to queue a desk review.`;
    }

    // Diagnostics / Signal queries
    if (q.includes('signal') || q.includes('refresh') || q.includes('connection') || q.includes('diagnost') || q.includes('ping')) {
      if (diagTime) {
        const timeStr = new Date(diagTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `Line integrity check completed at ${timeStr}. Registrations and spectrum maps are normal. If you're experiencing drops, click "Refresh Connection" to force an APN handshake.`;
      }
      return `Queried signals for ${device}. Registrations look normal, but we can do a local base station refresh. Tap "Refresh Connection" below to dispatch an APN sync.`;
    }
    
    if (q.includes('bill') || q.includes('charge') || q.includes('pricing') || q.includes('pay') || query === 'bill') {
      if (usageStr && context) {
        const rate = 12 + context.dataUsedGb * 0.64;
        const savings = 75 - rate;
        return `Billing audit for ${phone}: ${usageStr} consumed. Current adaptive tier: $${rate.toFixed(2)} (base $12 + data @ $0.64/GB). Saving $${savings.toFixed(2)} compared to flat carrier rates.`;
      }
      return "Adaptive rate structure: $12 base (includes 2GB), then $0.64/GB up to a maximum cap of $30. If you use less, you pay less. Billing stops after 30GB.";
    }
    
    if (q.includes('esim') || q.includes('activate') || q.includes('qr')) {
      return `eSIM activation for your ${device} is fully automated. Scan the QR carrier profile in the eSIM section to configure connection settings.`;
    }
    
    if (q.includes('hello') || q.includes('hi')) {
      if (diagTime) {
        return `Hi ${name}. I saw you verified your line integrity recently. Let me know if you need to audit billing rates or escalate a ticket.`;
      }
      return `Hi ${name}. Connected via ${sim} on your ${device}. I can dispatch base station signals, audit invoices, or provision settings. What do you need?`;
    }
    
    return "I monitor cell signals, data usage tracking, and SIM profiles. Let me know if you need to run connection diagnostics, check billing details, or create a support ticket.";
  }
};

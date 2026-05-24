// LocalStorage storage helpers for PacMac Mobile
export interface CartItem {
  type: 'device' | 'plan' | 'byop';
  name: string;
  price: number;
  monthlyPrice?: number;
  isFinanced?: boolean;
}

export interface UserSession {
  email: string;
  name?: string;
  phone?: string;
  status: 'active' | 'pending_activation';
  simType: 'eSIM' | 'Physical SIM';
  device?: string;
  activationDate?: string;
  usageData: {
    dataUsedGb: number;
    dataCapGb: number;
    daysRemaining: number;
    wifiGb: number;
    cellularGb: number;
  };
  savingsThisMonth: number;
  callsBlocked: number;
  scamTranscripts: Array<{
    id: string;
    caller: string;
    timestamp: string;
    type: string;
    dialog: Array<{ speaker: 'scammer' | 'packie'; text: string }>;
  }>;
}

const DEFAULT_SCAM_LOGS = [
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

export const mockUsers: Record<string, UserSession> = {
  'demo@pacmac.com': {
    email: 'demo@pacmac.com',
    name: 'Alex Mercer',
    phone: '+1 (510) 555-0198',
    status: 'active',
    simType: 'eSIM',
    device: 'Nothing Phone (2) Dark Edition',
    activationDate: '2026-04-12',
    usageData: {
      dataUsedGb: 8.4,
      dataCapGb: 30,
      daysRemaining: 12,
      wifiGb: 42.1,
      cellularGb: 8.4
    },
    savingsThisMonth: 18.50,
    callsBlocked: 27,
    scamTranscripts: DEFAULT_SCAM_LOGS
  }
};

export const getSession = (): UserSession | null => {
  const data = localStorage.getItem('pacmac_user_session');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  
  // Set default session for demonstration if none exists
  const defaultUser = mockUsers['demo@pacmac.com'];
  localStorage.setItem('pacmac_user_session', JSON.stringify(defaultUser));
  return defaultUser;
};

export const setSession = (session: UserSession | null) => {
  if (session) {
    localStorage.setItem('pacmac_user_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('pacmac_user_session');
  }
};

export const getCart = (): CartItem[] => {
  const data = localStorage.getItem('pacmac_cart');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

export const addToCart = (item: CartItem) => {
  const cart = getCart();
  cart.push(item);
  localStorage.setItem('pacmac_cart', JSON.stringify(cart));
};

export const clearCart = () => {
  localStorage.removeItem('pacmac_cart');
};

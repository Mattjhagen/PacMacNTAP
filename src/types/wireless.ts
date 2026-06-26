export type UserRole = 'admin' | 'customer';
export type AccountStatus = 'active' | 'pending_activation' | 'suspended' | 'deactivated';
export type SimStatus = 'unassigned' | 'provisioned' | 'active' | 'suspended' | 'deactivated';
export type SimType = 'SIM' | 'eSIM';
export type FraudRiskLevel = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  accountStatus: AccountStatus;
  simStatus: SimStatus;
  monthlyDataUsageGb: number;
  currentBillingCycleId: string;
  fraudProtectionStatus: 'enabled' | 'disabled';
  autoBlockMediumRisk: boolean;
}

export interface WirelessLine {
  id: string;
  customerId: string;
  phoneNumber: string;
  status: SimStatus;
  simId?: string;
  activatedAt?: string;
}

export interface SimCard {
  id: string;
  customerId?: string;
  iccid: string;
  eid?: string;
  type: SimType;
  status: SimStatus;
  qrCodeUrl?: string;
}

export interface UsageEvent {
  id: string;
  customerId: string;
  lineId: string;
  gbUsed: number;
  source: 'carrier_mock' | 'admin_simulator' | 'webhook';
  createdAt: string;
}

export interface BillingCycle {
  id: string;
  customerId: string;
  startsAt: string;
  endsAt: string;
  status: 'open' | 'closed';
}

export interface InvoiceEstimate {
  customerId: string;
  billingCycleId: string;
  usageGb: number;
  pricePerGb: number;
  monthlyCap: number;
  minimumCharge: number;
  estimatedCharge: number;
  capProgress: number;
}

export interface BlockedNumber {
  id: string;
  customerId: string;
  phoneNumber: string;
  reason: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  customerId: string;
  callerNumber: string;
  calledNumber: string;
  riskLevel: FraudRiskLevel;
  action: 'allowed' | 'warned' | 'blocked';
  transcriptUrl?: string;
  audioUrl?: string;
  notes: string;
  createdAt: string;
}

export interface CarrierEvent {
  id: string;
  customerId: string;
  lineId?: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  targetId: string;
  createdAt: string;
}

export interface WirelessOsState {
  users: User[];
  customers: CustomerProfile[];
  lines: WirelessLine[];
  sims: SimCard[];
  usageEvents: UsageEvent[];
  billingCycles: BillingCycle[];
  blockedNumbers: BlockedNumber[];
  fraudAlerts: FraudAlert[];
  carrierEvents: CarrierEvent[];
  adminAuditLogs: AdminAuditLog[];
}

export interface IncomingCallPayload {
  callerNumber: string;
  calledNumber: string;
  timestamp?: string;
  transcriptUrl?: string;
  audioUrl?: string;
  transcriptText?: string;
}

export interface BillingConfig {
  pricePerGb: number;
  monthlyCap: number;
  minimumCharge: number;
  minimumChargeEnabled: boolean;
}

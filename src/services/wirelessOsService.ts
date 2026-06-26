import {
  AdminAuditLog,
  BillingConfig,
  BillingCycle,
  BlockedNumber,
  CarrierEvent,
  CustomerProfile,
  FraudAlert,
  FraudRiskLevel,
  IncomingCallPayload,
  InvoiceEstimate,
  SimCard,
  UsageEvent,
  WirelessLine,
  WirelessOsState
} from '../types/wireless';

const STORAGE_KEY = 'pacmac_wireless_os_state_v1';
const env = (((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {}) as Record<
  string,
  string | undefined
>);

export const billingConfig: BillingConfig = {
  pricePerGb: Number(env.VITE_PRICE_PER_GB || 3),
  monthlyCap: Number(env.VITE_MONTHLY_CAP || 30),
  minimumCharge: Number(env.VITE_MINIMUM_CHARGE || 0),
  minimumChargeEnabled: env.VITE_MINIMUM_CHARGE_ENABLED === 'true'
};

const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const roundMoney = (value: number) => Math.round(value * 100) / 100;

function currentCycle(customerId: string, offset = 0): BillingCycle {
  const now = new Date();
  const startsAt = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const endsAt = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59);
  return {
    id: `cycle_${customerId}_${startsAt.toISOString().slice(0, 7)}`,
    customerId,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: 'open'
  };
}

function createSeedState(): WirelessOsState {
  const customers: CustomerProfile[] = [
    {
      id: 'cus_maya',
      userId: 'usr_maya',
      name: 'Maya Chen',
      email: 'demo@pacmac.com',
      phoneNumber: '+1 512 555 0148',
      accountStatus: 'active',
      simStatus: 'active',
      monthlyDataUsageGb: 8.4,
      currentBillingCycleId: 'cycle_cus_maya_current',
      fraudProtectionStatus: 'enabled',
      autoBlockMediumRisk: false
    },
    {
      id: 'cus_jordan',
      userId: 'usr_jordan',
      name: 'Jordan Ellis',
      email: 'jordan@pacmac.example',
      phoneNumber: '+1 737 555 0191',
      accountStatus: 'active',
      simStatus: 'active',
      monthlyDataUsageGb: 14.8,
      currentBillingCycleId: 'cycle_cus_jordan_current',
      fraudProtectionStatus: 'enabled',
      autoBlockMediumRisk: true
    },
    {
      id: 'cus_rivera',
      userId: 'usr_rivera',
      name: 'Sam Rivera',
      email: 'sam@pacmac.example',
      phoneNumber: '+1 210 555 0172',
      accountStatus: 'suspended',
      simStatus: 'suspended',
      monthlyDataUsageGb: 2.2,
      currentBillingCycleId: 'cycle_cus_rivera_current',
      fraudProtectionStatus: 'enabled',
      autoBlockMediumRisk: false
    }
  ];

  const lines: WirelessLine[] = customers.map((customer, index) => ({
    id: `line_${customer.id}`,
    customerId: customer.id,
    phoneNumber: customer.phoneNumber,
    status: customer.simStatus,
    simId: `sim_${customer.id}`,
    activatedAt: index === 2 ? undefined : nowIso()
  }));

  const sims: SimCard[] = customers.map((customer, index) => ({
    id: `sim_${customer.id}`,
    customerId: customer.id,
    iccid: `89014103211118510${index}42`,
    eid: `89049032${index}000000000000000000000${index}`,
    type: index === 1 ? 'SIM' : 'eSIM',
    status: customer.simStatus,
    qrCodeUrl: index === 1 ? undefined : `pacmac-esim://${customer.id}`
  }));

  const billingCycles = customers.map((customer) => ({
    ...currentCycle(customer.id),
    id: customer.currentBillingCycleId
  }));

  return {
    users: [
      { id: 'admin_1', role: 'admin', email: 'admin@pacmac.com', name: 'PacMac Ops' },
      ...customers.map((customer) => ({
        id: customer.userId,
        role: 'customer' as const,
        email: customer.email,
        name: customer.name
      }))
    ],
    customers,
    lines,
    sims,
    usageEvents: customers.map((customer) => ({
      id: `usage_seed_${customer.id}`,
      customerId: customer.id,
      lineId: `line_${customer.id}`,
      gbUsed: customer.monthlyDataUsageGb,
      source: 'carrier_mock',
      createdAt: nowIso()
    })),
    billingCycles,
    blockedNumbers: [
      {
        id: 'block_seed_1',
        customerId: 'cus_maya',
        phoneNumber: '+1 888 555 0199',
        reason: 'PackieAI high-risk scam pattern',
        createdAt: nowIso()
      }
    ],
    fraudAlerts: [
      {
        id: 'fraud_seed_1',
        customerId: 'cus_maya',
        callerNumber: '+1 888 555 0199',
        calledNumber: '+1 512 555 0148',
        riskLevel: 'high',
        action: 'blocked',
        notes: 'Caller requested payment credentials and attempted urgency escalation.',
        createdAt: nowIso()
      },
      {
        id: 'fraud_seed_2',
        customerId: 'cus_jordan',
        callerNumber: '+1 866 555 0120',
        calledNumber: '+1 737 555 0191',
        riskLevel: 'medium',
        action: 'blocked',
        notes: 'Medium-risk carrier-support impersonation. Customer auto-block preference applied.',
        createdAt: nowIso()
      }
    ],
    carrierEvents: [],
    adminAuditLogs: []
  };
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

let memoryState: WirelessOsState | null = null;

function readState(): WirelessOsState {
  if (!canUseStorage()) {
    memoryState ||= createSeedState();
    return structuredClone(memoryState);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as WirelessOsState;
  } catch {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function writeState(state: WirelessOsState) {
  if (!canUseStorage()) {
    memoryState = structuredClone(state);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('pacmac-wireless-os-change'));
}

function audit(state: WirelessOsState, action: string, targetId: string, actor = 'admin@pacmac.com') {
  state.adminAuditLogs.unshift({
    id: id('audit'),
    actor,
    action,
    targetId,
    createdAt: nowIso()
  });
}

function carrierEvent(
  state: WirelessOsState,
  customerId: string,
  eventType: string,
  payload: Record<string, unknown>,
  lineId?: string
) {
  state.carrierEvents.unshift({
    id: id('carrier_evt'),
    customerId,
    lineId,
    eventType,
    payload,
    createdAt: nowIso()
  });
}

function syncCustomerUsage(state: WirelessOsState, customerId: string) {
  const total = state.usageEvents
    .filter((event) => event.customerId === customerId)
    .reduce((sum, event) => sum + Number(event.gbUsed || 0), 0);
  const customer = state.customers.find((item) => item.id === customerId);
  if (customer) customer.monthlyDataUsageGb = Number(total.toFixed(2));
}

export function calculateInvoiceEstimate(
  usageGb: number,
  billingCycleId = 'cycle_preview',
  customerId = 'preview',
  config = billingConfig
): InvoiceEstimate {
  const usageCharge = usageGb * config.pricePerGb;
  const withMinimum = config.minimumChargeEnabled ? Math.max(usageCharge, config.minimumCharge) : usageCharge;
  const estimatedCharge = roundMoney(Math.min(withMinimum, config.monthlyCap));

  return {
    customerId,
    billingCycleId,
    usageGb: Number(usageGb.toFixed(2)),
    pricePerGb: config.pricePerGb,
    monthlyCap: config.monthlyCap,
    minimumCharge: config.minimumChargeEnabled ? config.minimumCharge : 0,
    estimatedCharge,
    capProgress: Math.min(100, Math.round((estimatedCharge / config.monthlyCap) * 100))
  };
}

export function analyzePackieRisk(payload: IncomingCallPayload): { riskLevel: FraudRiskLevel; notes: string } {
  const text = `${payload.callerNumber} ${payload.transcriptText || ''} ${payload.transcriptUrl || ''}`.toLowerCase();
  const highRiskTerms = ['gift card', 'wire transfer', 'crypto', 'password', 'social security', 'bank login', 'urgent payment'];
  const mediumRiskTerms = ['verify account', 'carrier support', 'limited time', 'unknown caller', 'payment issue'];

  if (highRiskTerms.some((term) => text.includes(term)) || payload.callerNumber.includes('888')) {
    return {
      riskLevel: 'high',
      notes: 'High-risk scam indicators detected by PackieAI mock analyzer.'
    };
  }

  if (mediumRiskTerms.some((term) => text.includes(term)) || payload.callerNumber.includes('866')) {
    return {
      riskLevel: 'medium',
      notes: 'Medium-risk social-engineering pattern detected by PackieAI mock analyzer.'
    };
  }

  return {
    riskLevel: 'low',
    notes: 'No material scam indicators detected by PackieAI mock analyzer.'
  };
}

export interface CarrierAdapter {
  provisionSim(customer: CustomerProfile, type?: 'SIM' | 'eSIM'): SimCard;
  activateSim(simId: string): WirelessLine;
  suspendSim(simId: string): WirelessLine;
  getUsage(customerId: string): number;
  getLineStatus(phoneNumber: string): WirelessLine | undefined;
  portNumber(customerId: string, portingInfo: Record<string, unknown>): WirelessLine;
  deactivateLine(customerId: string): WirelessLine;
}

class MockCarrierAdapter implements CarrierAdapter {
  provisionSim(customer: CustomerProfile, type: 'SIM' | 'eSIM' = 'eSIM') {
    const state = readState();
    const existingLine = state.lines.find((line) => line.customerId === customer.id);
    const sim: SimCard = {
      id: id('sim'),
      customerId: customer.id,
      iccid: `8901410${Math.floor(Math.random() * 10_000_000_000)}`,
      eid: type === 'eSIM' ? `89049032${Math.floor(Math.random() * 10_000_000_000)}` : undefined,
      type,
      status: 'provisioned',
      qrCodeUrl: type === 'eSIM' ? `pacmac-esim://${customer.id}/${Date.now()}` : undefined
    };
    state.sims.unshift(sim);
    customer.simStatus = 'provisioned';
    const customerRecord = state.customers.find((item) => item.id === customer.id);
    if (customerRecord) customerRecord.simStatus = 'provisioned';
    if (existingLine) existingLine.simId = sim.id;
    carrierEvent(state, customer.id, 'mock.sim.provisioned', { simId: sim.id, type }, existingLine?.id);
    audit(state, 'Provisioned SIM/eSIM', customer.id);
    writeState(state);
    return sim;
  }

  activateSim(simId: string) {
    return updateLineBySim(simId, 'active', 'mock.sim.activated');
  }

  suspendSim(simId: string) {
    return updateLineBySim(simId, 'suspended', 'mock.sim.suspended');
  }

  getUsage(customerId: string) {
    const state = readState();
    return state.customers.find((customer) => customer.id === customerId)?.monthlyDataUsageGb || 0;
  }

  getLineStatus(phoneNumber: string) {
    return readState().lines.find((line) => line.phoneNumber === phoneNumber);
  }

  portNumber(customerId: string, portingInfo: Record<string, unknown>) {
    const state = readState();
    const line = state.lines.find((item) => item.customerId === customerId);
    const customer = state.customers.find((item) => item.id === customerId);
    if (!line || !customer) throw new Error('Customer line not found');
    const nextNumber = String(portingInfo.phoneNumber || line.phoneNumber);
    line.phoneNumber = nextNumber;
    customer.phoneNumber = nextNumber;
    carrierEvent(state, customerId, 'mock.line.ported', { portingInfo }, line.id);
    audit(state, 'Ported number', customerId);
    writeState(state);
    return line;
  }

  deactivateLine(customerId: string) {
    const state = readState();
    const line = state.lines.find((item) => item.customerId === customerId);
    const customer = state.customers.find((item) => item.id === customerId);
    if (!line || !customer) throw new Error('Customer line not found');
    line.status = 'deactivated';
    customer.accountStatus = 'deactivated';
    customer.simStatus = 'deactivated';
    carrierEvent(state, customerId, 'mock.line.deactivated', {}, line.id);
    audit(state, 'Deactivated line', customerId);
    writeState(state);
    return line;
  }
}

function updateLineBySim(simId: string, status: 'active' | 'suspended', eventType: string) {
  const state = readState();
  const sim = state.sims.find((item) => item.id === simId);
  if (!sim?.customerId) throw new Error('SIM not assigned');
  const line = state.lines.find((item) => item.customerId === sim.customerId);
  const customer = state.customers.find((item) => item.id === sim.customerId);
  if (!line || !customer) throw new Error('Customer line not found');
  sim.status = status;
  line.status = status;
  line.simId = sim.id;
  line.activatedAt = status === 'active' ? nowIso() : line.activatedAt;
  customer.simStatus = status;
  customer.accountStatus = status === 'suspended' ? 'suspended' : 'active';
  carrierEvent(state, customer.id, eventType, { simId }, line.id);
  audit(state, status === 'active' ? 'Activated SIM/eSIM' : 'Suspended SIM/eSIM', customer.id);
  writeState(state);
  return line;
}

export const mockCarrierAdapter = new MockCarrierAdapter();

export const wirelessOsService = {
  resetDemoData() {
    const seed = createSeedState();
    writeState(seed);
    return seed;
  },

  getState() {
    return readState();
  },

  listCustomers() {
    return readState().customers;
  },

  getCustomer(customerIdOrEmail?: string) {
    const state = readState();
    if (!customerIdOrEmail) return state.customers[0];
    return (
      state.customers.find((customer) => customer.id === customerIdOrEmail) ||
      state.customers.find((customer) => customer.email.toLowerCase() === customerIdOrEmail.toLowerCase()) ||
      state.customers[0]
    );
  },

  createCustomer(input: Pick<CustomerProfile, 'name' | 'email' | 'phoneNumber'>) {
    const state = readState();
    const customerId = id('cus');
    const lineId = id('line');
    const customer: CustomerProfile = {
      id: customerId,
      userId: id('usr'),
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
      accountStatus: 'pending_activation',
      simStatus: 'unassigned',
      monthlyDataUsageGb: 0,
      currentBillingCycleId: currentCycle(customerId).id,
      fraudProtectionStatus: 'enabled',
      autoBlockMediumRisk: false
    };
    state.customers.unshift(customer);
    state.users.unshift({ id: customer.userId, role: 'customer', email: customer.email, name: customer.name });
    state.lines.unshift({ id: lineId, customerId, phoneNumber: customer.phoneNumber, status: 'unassigned' });
    state.billingCycles.unshift(currentCycle(customerId));
    audit(state, 'Created customer', customerId);
    writeState(state);
    return customer;
  },

  simulateUsage(customerId: string, gbUsed: number) {
    const state = readState();
    const line = state.lines.find((item) => item.customerId === customerId);
    if (!line) throw new Error('Customer line not found');
    const event: UsageEvent = {
      id: id('usage'),
      customerId,
      lineId: line.id,
      gbUsed: Number(gbUsed),
      source: 'admin_simulator',
      createdAt: nowIso()
    };
    state.usageEvents.unshift(event);
    syncCustomerUsage(state, customerId);
    carrierEvent(state, customerId, 'mock.usage.recorded', { gbUsed }, line.id);
    audit(state, `Simulated ${gbUsed} GB usage`, customerId);
    writeState(state);
    return event;
  },

  getInvoiceEstimate(customerId: string) {
    const state = readState();
    const customer = state.customers.find((item) => item.id === customerId);
    if (!customer) throw new Error('Customer not found');
    return calculateInvoiceEstimate(
      customer.monthlyDataUsageGb,
      customer.currentBillingCycleId,
      customer.id,
      billingConfig
    );
  },

  getAdminMetrics() {
    const state = readState();
    const estimates = state.customers.map((customer) =>
      calculateInvoiceEstimate(customer.monthlyDataUsageGb, customer.currentBillingCycleId, customer.id)
    );
    return {
      totalCustomers: state.customers.length,
      activeLines: state.lines.filter((line) => line.status === 'active').length,
      suspendedLines: state.lines.filter((line) => line.status === 'suspended').length,
      estimatedMonthlyRevenue: roundMoney(estimates.reduce((sum, estimate) => sum + estimate.estimatedCharge, 0)),
      totalUsageGb: roundMoney(state.customers.reduce((sum, customer) => sum + customer.monthlyDataUsageGb, 0)),
      highRiskAlerts: state.fraudAlerts.filter((alert) => alert.riskLevel === 'high').length,
      blockedNumbers: state.blockedNumbers.length
    };
  },

  handleIncomingCall(payload: IncomingCallPayload) {
    const state = readState();
    const customer = state.customers.find((item) => item.phoneNumber === payload.calledNumber) || state.customers[0];
    const result = analyzePackieRisk(payload);
    const shouldBlock =
      result.riskLevel === 'high' || (result.riskLevel === 'medium' && customer.autoBlockMediumRisk);
    const alert: FraudAlert = {
      id: id('fraud'),
      customerId: customer.id,
      callerNumber: payload.callerNumber,
      calledNumber: payload.calledNumber,
      riskLevel: result.riskLevel,
      action: shouldBlock ? 'blocked' : result.riskLevel === 'medium' ? 'warned' : 'allowed',
      transcriptUrl: payload.transcriptUrl,
      audioUrl: payload.audioUrl,
      notes: result.notes,
      createdAt: payload.timestamp || nowIso()
    };
    state.fraudAlerts.unshift(alert);

    if (shouldBlock && !state.blockedNumbers.some((item) => item.customerId === customer.id && item.phoneNumber === payload.callerNumber)) {
      state.blockedNumbers.unshift({
        id: id('block'),
        customerId: customer.id,
        phoneNumber: payload.callerNumber,
        reason: `PackieAI ${result.riskLevel}-risk call`,
        createdAt: nowIso()
      });
    }

    writeState(state);
    return alert;
  },

  blockNumber(customerId: string, phoneNumber: string, reason = 'Customer blocked number') {
    const state = readState();
    const blocked: BlockedNumber = {
      id: id('block'),
      customerId,
      phoneNumber,
      reason,
      createdAt: nowIso()
    };
    state.blockedNumbers.unshift(blocked);
    writeState(state);
    return blocked;
  },

  unblockNumber(blockedNumberId: string) {
    const state = readState();
    state.blockedNumbers = state.blockedNumbers.filter((item) => item.id !== blockedNumberId);
    writeState(state);
  }
};

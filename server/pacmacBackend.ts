import crypto from 'crypto';

export type BackendRole = 'customer' | 'admin';

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: BackendRole;
  customerId?: string;
  passwordHash: string;
  passwordSalt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: BackendRole;
  customerId?: string;
}

export interface BackendCustomer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  accountStatus: 'active' | 'pending_activation' | 'suspended' | 'deactivated';
  simStatus: 'unassigned' | 'provisioned' | 'active' | 'suspended' | 'deactivated';
  fraudProtectionStatus: 'enabled' | 'disabled';
  billingCycle: {
    id: string;
    startsAt: string;
    endsAt: string;
  };
  line: {
    id: string;
    phoneNumber: string;
    status: string;
    simType: 'SIM' | 'eSIM';
    iccid: string;
  };
}

export interface UsageEventRecord {
  id: string;
  customerId: string;
  gbUsed: number;
  source: string;
  createdAt: string;
}

export interface FraudAlertRecord {
  id: string;
  customerId: string;
  callerNumber: string;
  riskLevel: 'low' | 'medium' | 'high';
  action: 'allowed' | 'warned' | 'blocked';
  notes: string;
  createdAt: string;
}

export interface BlockedNumberRecord {
  id: string;
  customerId: string;
  phoneNumber: string;
  reason: string;
  createdAt: string;
}

const SESSION_COOKIE = 'pacmac_session';
const JWT_SECRET = process.env.JWT_SECRET || 'pacmac-local-development-secret-change-me';
const PRICE_PER_GB = Number(process.env.PRICE_PER_GB || process.env.VITE_PRICE_PER_GB || 3);
const MONTHLY_CAP = Number(process.env.MONTHLY_CAP || process.env.VITE_MONTHLY_CAP || 30);

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function fromBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const passwordHash = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');
  return { passwordHash, passwordSalt: salt };
}

export function verifyPassword(password: string, user: BackendUser) {
  const candidate = hashPassword(password, user.passwordSalt).passwordHash;
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(user.passwordHash, 'hex'));
}

function publicUser(user: BackendUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    customerId: user.customerId
  };
}

export function createJwt(user: SessionUser) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId: user.customerId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
    })
  );
  const signature = base64Url(crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}

export function verifyJwt(token?: string): SessionUser | null {
  if (!token) return null;
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const expected = base64Url(crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest());
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const parsed = JSON.parse(fromBase64Url(payload));
  if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return {
    id: parsed.sub,
    email: parsed.email,
    name: parsed.name,
    role: parsed.role,
    customerId: parsed.customerId
  };
}

export function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey) acc[rawKey] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 8}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function currentCycle() {
  const now = new Date();
  const startsAt = new Date(now.getFullYear(), now.getMonth(), 1);
  const endsAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
}

const customerPassword = hashPassword('password123', 'pacmac_customer_seed_salt');
const adminPassword = hashPassword('admin123', 'pacmac_admin_seed_salt');
const cycle = currentCycle();

const users: BackendUser[] = [
  {
    id: 'usr_customer_seed',
    email: 'customer@pacmacmobile.com',
    name: 'Maya Chen',
    role: 'customer',
    customerId: 'cus_seed_customer',
    ...customerPassword
  },
  {
    id: 'usr_admin_seed',
    email: 'admin@pacmacmobile.com',
    name: 'PacMac Staff',
    role: 'admin',
    ...adminPassword
  }
];

const customers: BackendCustomer[] = [
  {
    id: 'cus_seed_customer',
    name: 'Maya Chen',
    email: 'customer@pacmacmobile.com',
    phoneNumber: '+1 512 555 0148',
    accountStatus: 'active',
    simStatus: 'active',
    fraudProtectionStatus: 'enabled',
    billingCycle: {
      id: 'cycle_seed_customer_current',
      ...cycle
    },
    line: {
      id: 'line_seed_customer',
      phoneNumber: '+1 512 555 0148',
      status: 'active',
      simType: 'eSIM',
      iccid: '89014103211118510042'
    }
  }
];

const usageEvents: UsageEventRecord[] = [
  { id: 'usage_1', customerId: 'cus_seed_customer', gbUsed: 2.1, source: 'carrier_mock', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'usage_2', customerId: 'cus_seed_customer', gbUsed: 1.8, source: 'carrier_mock', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'usage_3', customerId: 'cus_seed_customer', gbUsed: 4.5, source: 'carrier_mock', createdAt: new Date(Date.now() - 86400000).toISOString() }
];

const fraudAlerts: FraudAlertRecord[] = [
  {
    id: 'fraud_1',
    customerId: 'cus_seed_customer',
    callerNumber: '+1 888 555 0199',
    riskLevel: 'high',
    action: 'blocked',
    notes: 'PackieAI detected payment-pressure language and blocked the caller.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'fraud_2',
    customerId: 'cus_seed_customer',
    callerNumber: '+1 866 555 0120',
    riskLevel: 'medium',
    action: 'warned',
    notes: 'Possible support impersonation. The call was flagged for review.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const blockedNumbers: BlockedNumberRecord[] = [
  {
    id: 'block_1',
    customerId: 'cus_seed_customer',
    phoneNumber: '+1 888 555 0199',
    reason: 'PackieAI high-risk scam pattern',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'block_2',
    customerId: 'cus_seed_customer',
    phoneNumber: '+1 877 555 0144',
    reason: 'Customer blocked number',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

function usageFor(customerId: string) {
  return usageEvents.filter((event) => event.customerId === customerId);
}

export function billingEstimateFor(customerId: string) {
  const usageGb = usageFor(customerId).reduce((sum, event) => sum + event.gbUsed, 0);
  const estimatedCharge = Math.min(usageGb * PRICE_PER_GB, MONTHLY_CAP);
  return {
    usageGb: Math.round(usageGb * 100) / 100,
    pricePerGb: PRICE_PER_GB,
    monthlyCap: MONTHLY_CAP,
    estimatedCharge: Math.round(estimatedCharge * 100) / 100,
    capProgress: Math.min(100, Math.round((estimatedCharge / MONTHLY_CAP) * 100))
  };
}

export function login(email: string, password: string) {
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user)) {
    return { ok: false as const, error: 'Invalid email or password.' };
  }
  const safeUser = publicUser(user);
  return { ok: true as const, user: safeUser, token: createJwt(safeUser) };
}

export function signup(input: { name: string; email: string; password: string; phoneNumber?: string }) {
  if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
    return { ok: false as const, error: 'An account already exists for this email.' };
  }
  const customerId = `cus_${crypto.randomUUID()}`;
  const userId = `usr_${crypto.randomUUID()}`;
  const password = hashPassword(input.password);
  const customer: BackendCustomer = {
    id: customerId,
    name: input.name,
    email: input.email.toLowerCase(),
    phoneNumber: input.phoneNumber || '+1 555 555 0101',
    accountStatus: 'pending_activation',
    simStatus: 'provisioned',
    fraudProtectionStatus: 'enabled',
    billingCycle: {
      id: `cycle_${customerId}_current`,
      ...currentCycle()
    },
    line: {
      id: `line_${customerId}`,
      phoneNumber: input.phoneNumber || '+1 555 555 0101',
      status: 'provisioned',
      simType: 'eSIM',
      iccid: `8901410${Math.floor(Math.random() * 10_000_000_000)}`
    }
  };
  const user: BackendUser = {
    id: userId,
    email: input.email.toLowerCase(),
    name: input.name,
    role: 'customer',
    customerId,
    ...password
  };
  users.push(user);
  customers.push(customer);
  const safeUser = publicUser(user);
  return { ok: true as const, user: safeUser, token: createJwt(safeUser) };
}

export function getSessionUser(cookieHeader?: string) {
  return verifyJwt(parseCookies(cookieHeader)[SESSION_COOKIE]);
}

export function getCustomerDashboard(user: SessionUser) {
  if (user.role !== 'customer' || !user.customerId) {
    return { ok: false as const, status: 403, error: 'Customer access required.' };
  }
  const customer = customers.find((item) => item.id === user.customerId);
  if (!customer) return { ok: false as const, status: 404, error: 'Customer profile not found.' };
  return {
    ok: true as const,
    data: {
      customer,
      usageEvents: usageFor(customer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      billingEstimate: billingEstimateFor(customer.id),
      fraudAlerts: fraudAlerts.filter((alert) => alert.customerId === customer.id),
      blockedNumbers: blockedNumbers.filter((blocked) => blocked.customerId === customer.id),
      accountSettings: {
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        role: user.role,
        paperlessBilling: true,
        autopay: false
      }
    }
  };
}

export function setPackieProtection(user: SessionUser, enabled: boolean) {
  const customer = customers.find((item) => item.id === user.customerId);
  if (!customer) return { ok: false as const, status: 404, error: 'Customer profile not found.' };
  customer.fraudProtectionStatus = enabled ? 'enabled' : 'disabled';
  return { ok: true as const, fraudProtectionStatus: customer.fraudProtectionStatus };
}

export function blockNumber(user: SessionUser, phoneNumber: string) {
  if (!user.customerId) return { ok: false as const, status: 403, error: 'Customer access required.' };
  const existing = blockedNumbers.find((item) => item.customerId === user.customerId && item.phoneNumber === phoneNumber);
  if (existing) return { ok: true as const, blockedNumber: existing };
  const blockedNumber = {
    id: `block_${crypto.randomUUID()}`,
    customerId: user.customerId,
    phoneNumber,
    reason: 'Customer blocked number',
    createdAt: new Date().toISOString()
  };
  blockedNumbers.unshift(blockedNumber);
  return { ok: true as const, blockedNumber };
}

export function unblockNumber(user: SessionUser, blockedNumberId: string) {
  const index = blockedNumbers.findIndex((item) => item.id === blockedNumberId && item.customerId === user.customerId);
  if (index === -1) return { ok: false as const, status: 404, error: 'Blocked number not found.' };
  blockedNumbers.splice(index, 1);
  return { ok: true as const };
}

export function getSeedSummary() {
  return {
    users: users.map(publicUser),
    customers,
    usageEvents,
    fraudAlerts,
    blockedNumbers
  };
}

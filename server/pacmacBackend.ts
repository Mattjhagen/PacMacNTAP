import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

let supabaseAdmin: SupabaseClient | null | undefined;

function getSupabaseAdmin() {
  if (supabaseAdmin !== undefined) return supabaseAdmin;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasValidUrl = Boolean(url && /^https?:\/\//i.test(url));
  supabaseAdmin = hasValidUrl && key ? createClient(url!, key, { auth: { persistSession: false } }) : null;
  return supabaseAdmin;
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

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

function publicUserFromRow(row: any): SessionUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    customerId: row.customer_id || undefined
  };
}

function customerFromRows(customer: any, line?: any, sim?: any, cycleRow?: any): BackendCustomer {
  const cycle = cycleRow || currentCycle();
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phoneNumber: customer.phone_number,
    accountStatus: customer.account_status,
    simStatus: customer.sim_status,
    fraudProtectionStatus: customer.fraud_protection_status,
    billingCycle: {
      id: cycle.id || `cycle_${customer.id}_current`,
      startsAt: cycle.starts_at || cycle.startsAt,
      endsAt: cycle.ends_at || cycle.endsAt
    },
    line: {
      id: line?.id || `line_${customer.id}`,
      phoneNumber: line?.phone_number || customer.phone_number,
      status: line?.status || customer.sim_status,
      simType: sim?.sim_type || 'eSIM',
      iccid: sim?.iccid || 'pending'
    }
  };
}

function usageEventFromRow(row: any): UsageEventRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    gbUsed: Number(row.gb_used || 0),
    source: row.source,
    createdAt: row.created_at
  };
}

function fraudAlertFromRow(row: any): FraudAlertRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    callerNumber: row.caller_number,
    riskLevel: row.risk_level,
    action: row.action,
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

function blockedNumberFromRow(row: any): BlockedNumberRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    phoneNumber: row.phone_number,
    reason: row.reason || 'Customer blocked number',
    createdAt: row.created_at
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

export async function billingEstimateForCustomer(customerId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase && isUuid(customerId)) {
    const { data, error } = await supabase.from('usage_events').select('gb_used').eq('customer_id', customerId);
    if (error) throw error;
    const usageGb = (data || []).reduce((sum, row: any) => sum + Number(row.gb_used || 0), 0);
    const estimatedCharge = Math.min(usageGb * PRICE_PER_GB, MONTHLY_CAP);
    return {
      usageGb: Math.round(usageGb * 100) / 100,
      pricePerGb: PRICE_PER_GB,
      monthlyCap: MONTHLY_CAP,
      estimatedCharge: Math.round(estimatedCharge * 100) / 100,
      capProgress: Math.min(100, Math.round((estimatedCharge / MONTHLY_CAP) * 100))
    };
  }
  return billingEstimateFor(customerId);
}

export async function joinWaitlist(input: { name?: string; email: string }) {
  const email = input.email.toLowerCase().trim();
  const name = input.name?.trim() || email.split('@')[0];
  if (!email) return { ok: false as const, status: 400, error: 'Email is required.' };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (lookupError) {
      console.warn('[PacMac Supabase] Waitlist lookup failed, using memory fallback:', lookupError.message);
    } else if (existing) {
      return {
        ok: true as const,
        entry: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          waitlistNumber: existing.waitlist_number,
          status: existing.status,
          createdAt: existing.created_at
        }
      };
    } else {
      const { count } = await supabase.from('waitlist').select('id', { count: 'exact', head: true });
      const waitlistNumber = 2500 + (count || 0) + 1;
      const { data, error } = await supabase
        .from('waitlist')
        .insert({ name, email, waitlist_number: waitlistNumber, status: 'active' })
        .select('*')
        .single();
      if (error) return { ok: false as const, status: 500, error: error.message };
      return {
        ok: true as const,
        entry: {
          id: data.id,
          name: data.name,
          email: data.email,
          waitlistNumber: data.waitlist_number,
          status: data.status,
          createdAt: data.created_at
        }
      };
    }
  }

  const waitlistNumber = Math.floor(Math.random() * 450) + 2480;
  return {
    ok: true as const,
    entry: {
      id: `wait_${crypto.randomUUID()}`,
      name,
      email,
      waitlistNumber,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  };
}

export async function login(email: string, password: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: row, error } = await supabase
      .from('pacmac_app_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.warn('[PacMac Supabase] Login lookup failed, falling back to seed users:', error.message);
    } else if (row) {
      const user: BackendUser = {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        customerId: row.customer_id || undefined,
        passwordHash: row.password_hash,
        passwordSalt: row.password_salt
      };
      if (!verifyPassword(password, user)) return { ok: false as const, error: 'Invalid email or password.' };
      const safeUser = publicUser(user);
      return { ok: true as const, user: safeUser, token: createJwt(safeUser) };
    }
  }

  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user)) {
    return { ok: false as const, error: 'Invalid email or password.' };
  }
  const safeUser = publicUser(user);
  return { ok: true as const, user: safeUser, token: createJwt(safeUser) };
}

export async function signup(input: { name: string; email: string; password: string; phoneNumber?: string }) {
  const email = input.email.toLowerCase();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: existing, error: existingError } = await supabase
      .from('pacmac_app_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingError) {
      console.warn('[PacMac Supabase] Signup lookup failed, falling back to memory:', existingError.message);
    } else {
      if (existing) return { ok: false as const, error: 'An account already exists for this email.' };

      const password = hashPassword(input.password);
      const customerId = crypto.randomUUID();
      const lineId = crypto.randomUUID();
      const simId = crypto.randomUUID();
      const cycleId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const phoneNumber = input.phoneNumber || '+1 555 555 0101';
      const cycle = currentCycle();

      const { error: customerError } = await supabase.from('customer_profiles').insert({
        id: customerId,
        name: input.name,
        email,
        phone_number: phoneNumber,
        account_status: 'pending_activation',
        sim_status: 'provisioned',
        fraud_protection_status: 'enabled',
        auto_block_medium_risk: false
      });
      if (customerError) return { ok: false as const, error: customerError.message };

      const { error: lineError } = await supabase.from('wireless_lines').insert({
        id: lineId,
        customer_id: customerId,
        phone_number: phoneNumber,
        status: 'provisioned'
      });
      if (lineError) return { ok: false as const, error: lineError.message };

      const { error: simError } = await supabase.from('sim_cards').insert({
        id: simId,
        customer_id: customerId,
        line_id: lineId,
        iccid: `8901410${Math.floor(Math.random() * 10_000_000_000)}`,
        eid: `89049032${Math.floor(Math.random() * 10_000_000_000)}`,
        sim_type: 'eSIM',
        status: 'provisioned',
        qr_code_url: `pacmac-esim://${customerId}`
      });
      if (simError) return { ok: false as const, error: simError.message };

      const { error: cycleError } = await supabase.from('billing_cycles').insert({
        id: cycleId,
        customer_id: customerId,
        starts_at: cycle.startsAt,
        ends_at: cycle.endsAt,
        status: 'open'
      });
      if (cycleError) return { ok: false as const, error: cycleError.message };

      const { error: userError } = await supabase.from('pacmac_app_users').insert({
        id: userId,
        email,
        name: input.name,
        role: 'customer',
        customer_id: customerId,
        password_hash: password.passwordHash,
        password_salt: password.passwordSalt
      });
      if (userError) return { ok: false as const, error: userError.message };

      const safeUser: SessionUser = { id: userId, email, name: input.name, role: 'customer', customerId };
      return { ok: true as const, user: safeUser, token: createJwt(safeUser) };
    }
  }

  if (users.some((user) => user.email.toLowerCase() === email)) {
    return { ok: false as const, error: 'An account already exists for this email.' };
  }
  const customerId = `cus_${crypto.randomUUID()}`;
  const userId = `usr_${crypto.randomUUID()}`;
  const password = hashPassword(input.password);
  const customer: BackendCustomer = {
    id: customerId,
    name: input.name,
    email,
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
    email,
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

async function getSupabaseCustomerDashboard(user: SessionUser) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !user.customerId || !isUuid(user.customerId)) return null;

  const { data: customer, error: customerError } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', user.customerId)
    .maybeSingle();
  if (customerError) throw customerError;
  if (!customer) return { ok: false as const, status: 404, error: 'Customer profile not found.' };

  const [{ data: line }, { data: sim }, { data: cycle }, { data: usageRows }, { data: alertRows }, { data: blockedRows }] =
    await Promise.all([
      supabase.from('wireless_lines').select('*').eq('customer_id', user.customerId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('sim_cards').select('*').eq('customer_id', user.customerId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('billing_cycles').select('*').eq('customer_id', user.customerId).eq('status', 'open').order('starts_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('usage_events').select('*').eq('customer_id', user.customerId).order('created_at', { ascending: false }),
      supabase.from('fraud_alerts').select('*').eq('customer_id', user.customerId).order('created_at', { ascending: false }),
      supabase.from('blocked_numbers').select('*').eq('customer_id', user.customerId).order('created_at', { ascending: false })
    ]);

  const usageEvents = (usageRows || []).map(usageEventFromRow);
  const usageGb = usageEvents.reduce((sum, event) => sum + event.gbUsed, 0);
  const estimatedCharge = Math.min(usageGb * PRICE_PER_GB, MONTHLY_CAP);

  return {
    ok: true as const,
    data: {
      customer: customerFromRows(customer, line, sim, cycle),
      usageEvents,
      billingEstimate: {
        usageGb: Math.round(usageGb * 100) / 100,
        pricePerGb: PRICE_PER_GB,
        monthlyCap: MONTHLY_CAP,
        estimatedCharge: Math.round(estimatedCharge * 100) / 100,
        capProgress: Math.min(100, Math.round((estimatedCharge / MONTHLY_CAP) * 100))
      },
      fraudAlerts: (alertRows || []).map(fraudAlertFromRow),
      blockedNumbers: (blockedRows || []).map(blockedNumberFromRow),
      accountSettings: {
        email: customer.email,
        phoneNumber: customer.phone_number,
        role: user.role,
        paperlessBilling: true,
        autopay: false
      }
    }
  };
}

export async function getCustomerDashboard(user: SessionUser) {
  if (user.role !== 'customer' || !user.customerId) {
    return { ok: false as const, status: 403, error: 'Customer access required.' };
  }

  try {
    const supabaseDashboard = await getSupabaseCustomerDashboard(user);
    if (supabaseDashboard) return supabaseDashboard;
  } catch (error: any) {
    console.warn('[PacMac Supabase] Dashboard read failed, falling back to memory:', error.message);
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

export async function setPackieProtection(user: SessionUser, enabled: boolean) {
  const supabase = getSupabaseAdmin();
  if (supabase && user.customerId && isUuid(user.customerId)) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update({ fraud_protection_status: enabled ? 'enabled' : 'disabled' })
      .eq('id', user.customerId)
      .select('fraud_protection_status')
      .maybeSingle();
    if (error) return { ok: false as const, status: 500, error: error.message };
    if (!data) return { ok: false as const, status: 404, error: 'Customer profile not found.' };
    return { ok: true as const, fraudProtectionStatus: data.fraud_protection_status };
  }

  const customer = customers.find((item) => item.id === user.customerId);
  if (!customer) return { ok: false as const, status: 404, error: 'Customer profile not found.' };
  customer.fraudProtectionStatus = enabled ? 'enabled' : 'disabled';
  return { ok: true as const, fraudProtectionStatus: customer.fraudProtectionStatus };
}

export async function blockNumber(user: SessionUser, phoneNumber: string) {
  if (!user.customerId) return { ok: false as const, status: 403, error: 'Customer access required.' };
  const supabase = getSupabaseAdmin();
  if (supabase && isUuid(user.customerId)) {
    const { data: existing, error: existingError } = await supabase
      .from('blocked_numbers')
      .select('*')
      .eq('customer_id', user.customerId)
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    if (existingError) return { ok: false as const, status: 500, error: existingError.message };
    if (existing) return { ok: true as const, blockedNumber: blockedNumberFromRow(existing) };

    const { data, error } = await supabase
      .from('blocked_numbers')
      .insert({ customer_id: user.customerId, phone_number: phoneNumber, reason: 'Customer blocked number' })
      .select('*')
      .single();
    if (error) return { ok: false as const, status: 500, error: error.message };
    return { ok: true as const, blockedNumber: blockedNumberFromRow(data) };
  }

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

export async function unblockNumber(user: SessionUser, blockedNumberId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase && user.customerId && isUuid(user.customerId)) {
    const { error, count } = await supabase
      .from('blocked_numbers')
      .delete({ count: 'exact' })
      .eq('id', blockedNumberId)
      .eq('customer_id', user.customerId);
    if (error) return { ok: false as const, status: 500, error: error.message };
    if (!count) return { ok: false as const, status: 404, error: 'Blocked number not found.' };
    return { ok: true as const };
  }

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

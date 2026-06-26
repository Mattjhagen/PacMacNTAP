import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  billingEstimateFor,
  blockNumber,
  clearSessionCookie,
  getCustomerDashboard,
  getSeedSummary,
  getSessionUser,
  formatWaitlistResponse,
  joinWaitlist,
  listWaitlist,
  login,
  resetMemoryWaitlistForTests,
  sessionCookie,
  setPackieProtection,
  signup,
  unblockNumber,
  verifyJwt
} from '../server/pacmacBackend.ts';

test('customer login returns a customer JWT session', async () => {
  const result = await login('customer@pacmacmobile.com', 'password123');

  assert.equal(result.ok, true);
  if (result.ok) {
    const session = verifyJwt(result.token);
    assert.equal(session?.role, 'customer');
    assert.equal(session?.email, 'customer@pacmacmobile.com');
  }
});

test('admin login returns an admin JWT session', async () => {
  const result = await login('admin@pacmacmobile.com', 'admin123');

  assert.equal(result.ok, true);
  if (result.ok) {
    const session = verifyJwt(result.token);
    assert.equal(session?.role, 'admin');
    assert.equal(session?.email, 'admin@pacmacmobile.com');
  }
});

test('customer cannot access admin-only data', async () => {
  const result = await login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (result.ok) {
    const session = verifyJwt(result.token);
    assert.notEqual(session?.role, 'admin');
  }
});

test('unauthenticated session cookie returns no current user', () => {
  assert.equal(getSessionUser(clearSessionCookie()), null);
});

test('customer dashboard only returns the logged-in customer data', async () => {
  const result = await login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const user = getSessionUser(sessionCookie(result.token));
  assert.ok(user);
  const dashboard = await getCustomerDashboard(user!);

  assert.equal(dashboard.ok, true);
  if (dashboard.ok) {
    assert.equal(dashboard.data.customer.email, 'customer@pacmacmobile.com');
    assert.ok(dashboard.data.usageEvents.every((event) => event.customerId === user!.customerId));
    assert.ok(dashboard.data.blockedNumbers.every((blocked) => blocked.customerId === user!.customerId));
  }
});

test('billing estimate respects the $30 cap', () => {
  const estimate = billingEstimateFor('cus_seed_customer');

  assert.ok(estimate.estimatedCharge <= 30);
  assert.equal(estimate.monthlyCap, 30);
});

test('PackieAI toggle updates the customer setting', async () => {
  const result = await login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const off = await setPackieProtection(result.user, false);
  assert.equal(off.ok, true);
  assert.equal(off.ok && off.fraudProtectionStatus, 'disabled');

  const on = await setPackieProtection(result.user, true);
  assert.equal(on.ok, true);
  assert.equal(on.ok && on.fraudProtectionStatus, 'enabled');
});

test('block and unblock number works for a customer', async () => {
  const result = await login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const blocked = await blockNumber(result.user, '+1 999 555 0123');
  assert.equal(blocked.ok, true);
  assert.equal(blocked.ok && blocked.blockedNumber.phoneNumber, '+1 999 555 0123');

  const unblocked = blocked.ok ? await unblockNumber(result.user, blocked.blockedNumber.id) : { ok: false };
  assert.equal(unblocked.ok, true);
});

test('signup creates customer accounts by default', async () => {
  const unique = `new-${Date.now()}@pacmacmobile.com`;
  const result = await signup({
    name: 'New Customer',
    email: unique,
    password: 'password123',
    phoneNumber: '+1 555 555 0188'
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.user.role, 'customer');
    assert.ok(getSeedSummary().customers.some((customer) => customer.email === unique));
  }
});

test('valid email inserts into waitlist with position based on created order', async () => {
  resetMemoryWaitlistForTests();
  const first = await joinWaitlist({ email: 'first@example.com', fullName: 'First User' });
  const second = await joinWaitlist({ email: 'second@example.com', fullName: 'Second User' });

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.ok && first.entry.position, 1);
  assert.equal(second.ok && second.entry.position, 2);
  assert.equal(second.ok && second.entry.status, 'pending');
});

test('duplicate waitlist email does not create duplicate row and returns existing position', async () => {
  resetMemoryWaitlistForTests();
  const first = await joinWaitlist({ email: 'duplicate@example.com', fullName: 'Original' });
  const duplicate = await joinWaitlist({ email: 'DUPLICATE@example.com', fullName: 'Duplicate' });
  const entries = await listWaitlist();

  assert.equal(first.ok, true);
  assert.equal(duplicate.ok, true);
  assert.equal(entries.length, 1);
  assert.equal(duplicate.ok && duplicate.duplicate, true);
  assert.equal(duplicate.ok && duplicate.entry.position, 1);
});

test('invalid waitlist email is rejected', async () => {
  resetMemoryWaitlistForTests();
  const result = await joinWaitlist({ email: 'not-an-email', fullName: 'Bad Email' });

  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 400);
});

test('waitlist API formatter never returns fake random number fields', async () => {
  resetMemoryWaitlistForTests();
  const result = await joinWaitlist({ email: 'format@example.com', fullName: 'Format User' });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const response = formatWaitlistResponse(result);
  assert.equal(response.position, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(response, 'waitlistNumber'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(response, 'queueNumber'), false);
});

test('frontend waitlist uses API response position', () => {
  const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8');
  const waitlist = readFileSync(new URL('../src/components/WaitlistSection.tsx', import.meta.url), 'utf8');

  assert.match(home, /data\.position/);
  assert.match(waitlist, /data\.position/);
  assert.doesNotMatch(home + waitlist, /waitlistNumber|Math\.random|2000\+/);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  billingEstimateFor,
  blockNumber,
  clearSessionCookie,
  getCustomerDashboard,
  getSeedSummary,
  getSessionUser,
  login,
  sessionCookie,
  setPackieProtection,
  signup,
  unblockNumber,
  verifyJwt
} from '../server/pacmacBackend.ts';

test('customer login returns a customer JWT session', () => {
  const result = login('customer@pacmacmobile.com', 'password123');

  assert.equal(result.ok, true);
  if (result.ok) {
    const session = verifyJwt(result.token);
    assert.equal(session?.role, 'customer');
    assert.equal(session?.email, 'customer@pacmacmobile.com');
  }
});

test('admin login returns an admin JWT session', () => {
  const result = login('admin@pacmacmobile.com', 'admin123');

  assert.equal(result.ok, true);
  if (result.ok) {
    const session = verifyJwt(result.token);
    assert.equal(session?.role, 'admin');
    assert.equal(session?.email, 'admin@pacmacmobile.com');
  }
});

test('customer cannot access admin-only data', () => {
  const result = login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (result.ok) {
    const session = verifyJwt(result.token);
    assert.notEqual(session?.role, 'admin');
  }
});

test('unauthenticated session cookie returns no current user', () => {
  assert.equal(getSessionUser(clearSessionCookie()), null);
});

test('customer dashboard only returns the logged-in customer data', () => {
  const result = login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const user = getSessionUser(sessionCookie(result.token));
  assert.ok(user);
  const dashboard = getCustomerDashboard(user!);

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

test('PackieAI toggle updates the customer setting', () => {
  const result = login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const off = setPackieProtection(result.user, false);
  assert.equal(off.ok, true);
  assert.equal(off.ok && off.fraudProtectionStatus, 'disabled');

  const on = setPackieProtection(result.user, true);
  assert.equal(on.ok, true);
  assert.equal(on.ok && on.fraudProtectionStatus, 'enabled');
});

test('block and unblock number works for a customer', () => {
  const result = login('customer@pacmacmobile.com', 'password123');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const blocked = blockNumber(result.user, '+1 999 555 0123');
  assert.equal(blocked.ok, true);
  assert.equal(blocked.ok && blocked.blockedNumber.phoneNumber, '+1 999 555 0123');

  const unblocked = blocked.ok ? unblockNumber(result.user, blocked.blockedNumber.id) : { ok: false };
  assert.equal(unblocked.ok, true);
});

test('signup creates customer accounts by default', () => {
  const unique = `new-${Date.now()}@pacmacmobile.com`;
  const result = signup({
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

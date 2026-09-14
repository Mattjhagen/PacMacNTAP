import assert from 'node:assert/strict';
import test from 'node:test';
import { connectedCarrier, connectedFleetResponse, HologramCarrierAdapter } from '../server/hologramService.ts';

test('default and explicit demo stay offline and return independent fixtures', async () => {
  const adapter = connectedCarrier({ HOLOGRAM_API_KEY: 'unused' });
  const fleet = await adapter.listDevices();
  assert.equal(fleet.mode, 'demo');
  fleet.devices.length = 0;
  assert.equal((await adapter.listDevices()).devices.length, 4);
});
test('live configuration fails closed', () => {
  for (const env of [{ HOLOGRAM_MODE: 'invalid' }, { HOLOGRAM_MODE: 'live' }, { HOLOGRAM_MODE: 'live', HOLOGRAM_API_KEY: 'key', HOLOGRAM_ORG_ID: 'bad' }]) {
    assert.throws(() => connectedCarrier(env));
  }
});
test('Hologram uses server auth, organization scope and bounded inventory without leaking provider fields', async () => {
  const request = async (input: any, options: any) => {
    const url = new URL(input);
    assert.equal(url.origin, 'https://dashboard.hologram.io');
    assert.equal(url.pathname, '/api/1/devices');
    assert.equal(url.searchParams.get('orgid'), '42');
    assert.equal(url.searchParams.get('withlocation'), 'false');
    assert.equal(url.searchParams.get('limit'), '100');
    assert.equal(options.headers.Authorization, `Basic ${Buffer.from('apikey:test-key').toString('base64')}`);
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal);
    return Response.json({ success: true, continues: true, data: [{ id: 7, orgid: 42, name: 'Tracker', imei: 'private', links: { cellular: [{ state: 'LIVE', sim: 'private' }] } }] });
  };
  assert.deepEqual(await new HologramCarrierAdapter('test-key', '42', request as typeof fetch).listDevices(), { mode: 'live', hasMore: true, devices: [{ id: '7', name: 'Tracker', state: 'LIVE' }] });
});
test('provider errors, malformed data and mismatched orgs are sanitized', async () => {
  for (const response of [new Response('secret', { status: 429 }), Response.json({ success: false, error: 'secret' }), Response.json({ success: true, data: {} }), Response.json({ success: true, data: [{ id: 1, orgid: 99 }] })]) {
    const adapter = new HologramCarrierAdapter('key', '42', (async () => response) as typeof fetch);
    await assert.rejects(adapter.listDevices(), { message: 'Hologram is unavailable. Please retry later.' });
  }
  await assert.rejects(new HologramCarrierAdapter('key', '42', (async () => { throw new Error('secret'); }) as typeof fetch).listDevices(), { message: 'Hologram is unavailable. Please retry later.' });
});
test('fleet requires admin session and rejects seed/unapproved users for live access', async () => {
  assert.equal((await connectedFleetResponse(null, {})).status, 401);
  assert.equal((await connectedFleetResponse({ id: 'customer', role: 'customer' }, {})).status, 403);
  assert.equal((await connectedFleetResponse({ id: 'admin', role: 'admin' }, {})).status, 200);
  const live = { HOLOGRAM_MODE: 'live', HOLOGRAM_ADMIN_IDS: 'usr_admin_seed' };
  assert.equal((await connectedFleetResponse({ id: 'usr_admin_seed', role: 'admin' }, live)).status, 403);
  assert.equal((await connectedFleetResponse({ id: 'other', role: 'admin' }, live)).status, 403);
  assert.equal((await connectedFleetResponse({ id: 'trusted', role: 'admin' }, { HOLOGRAM_MODE: 'live', HOLOGRAM_ADMIN_IDS: 'trusted' })).status, 503);
});

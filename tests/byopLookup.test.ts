import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DeviceLookupService,
  formatByopApiResponse,
  localTacDatabase
} from '../server/deviceLookupService.ts';

test('IMEI validation requires 15 digits and a valid Luhn checksum', () => {
  assert.equal(DeviceLookupService.validate_imei('353041101234562'), true);
  assert.equal(DeviceLookupService.validate_imei('353041101234563'), false);
  assert.equal(DeviceLookupService.validate_imei('35304110abc4562'), false);
});

test('TAC extraction uses the first 8 IMEI digits', () => {
  assert.equal(DeviceLookupService.extract_tac('353041101234562'), '35304110');
});

test('known TAC returns the database device record', async () => {
  const service = new DeviceLookupService({
    async lookup(imei) {
      const tac = DeviceLookupService.extract_tac(imei);
      return localTacDatabase.find((record) => record.tac === tac) || null;
    }
  });

  const result = await service.check_byop_compatibility('353041101234562');
  assert.equal(result.imei_valid, true);
  assert.equal(result.tac, '35304110');
  assert.equal(result.brand, 'Apple');
  assert.equal(result.model, 'iPhone 14');
  assert.equal(result.compatibility_status, 'likely_compatible');
});

test('valid unknown TAC is sent to manual review without fabricated model data', async () => {
  const service = new DeviceLookupService({ async lookup() { return null; } });
  const result = await service.check_byop_compatibility('864209751234560');
  const response = formatByopApiResponse(result);

  assert.equal(response.success, true);
  assert.equal(response.imei_valid, true);
  assert.equal(response.tac, '86420975');
  assert.equal(response.device, null);
  assert.equal(response.compatibility_status, 'needs_manual_review');
});

test('invalid IMEI response is rejected before lookup', async () => {
  const service = new DeviceLookupService({
    async lookup() {
      throw new Error('lookup should not run for invalid IMEI');
    }
  });
  const response = formatByopApiResponse(await service.check_byop_compatibility('123'));

  assert.equal(response.success, false);
  assert.equal(response.imei_valid, false);
});

test('BYOP frontend uses backend lookup response instead of fake heuristics', () => {
  const byopPage = readFileSync(new URL('../src/pages/BYOP.tsx', import.meta.url), 'utf8');
  const service = readFileSync(new URL('../src/services/compatibilityService.ts', import.meta.url), 'utf8');
  const checkout = readFileSync(new URL('../src/services/checkoutService.ts', import.meta.url), 'utf8');

  assert.match(service, /\/api\/byop\/check-imei/);
  assert.doesNotMatch(service, /startsWith|setTimeout|Pixel 8 Pro|Nothing|Galaxy S24 Ultra|plays perfectly|fully compatible/);
  assert.doesNotMatch(byopPage, /plays perfectly|fully compatible|compatible instantly/);
  assert.doesNotMatch(byopPage + checkout, /pacmac_checkout_imei['"]/);
  assert.match(byopPage + checkout, /imei_last4/);
});

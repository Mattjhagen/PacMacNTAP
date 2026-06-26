import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzePackieRisk,
  calculateInvoiceEstimate,
  mockCarrierAdapter,
  wirelessOsService
} from '../src/services/wirelessOsService.ts';

test('billing estimate charges for usage but never exceeds the monthly cap', () => {
  const lightUsage = calculateInvoiceEstimate(4, 'cycle_test', 'cus_test', {
    pricePerGb: 3,
    monthlyCap: 30,
    minimumCharge: 0,
    minimumChargeEnabled: false
  });

  const heavyUsage = calculateInvoiceEstimate(80, 'cycle_test', 'cus_test', {
    pricePerGb: 3,
    monthlyCap: 30,
    minimumCharge: 0,
    minimumChargeEnabled: false
  });

  assert.equal(lightUsage.estimatedCharge, 12);
  assert.equal(heavyUsage.estimatedCharge, 30);
  assert.equal(heavyUsage.capProgress, 100);
});

test('billing minimum charge remains disabled unless configured', () => {
  const estimate = calculateInvoiceEstimate(0.25, 'cycle_test', 'cus_test', {
    pricePerGb: 3,
    monthlyCap: 30,
    minimumCharge: 10,
    minimumChargeEnabled: false
  });

  assert.equal(estimate.estimatedCharge, 0.75);
});

test('PackieAI mock analyzer routes high, medium, and low risk calls', () => {
  assert.equal(
    analyzePackieRisk({
      callerNumber: '+1 888 555 1111',
      calledNumber: '+1 512 555 0148',
      transcriptText: 'urgent payment by gift card'
    }).riskLevel,
    'high'
  );

  assert.equal(
    analyzePackieRisk({
      callerNumber: '+1 866 555 1111',
      calledNumber: '+1 512 555 0148',
      transcriptText: 'verify account with carrier support'
    }).riskLevel,
    'medium'
  );

  assert.equal(
    analyzePackieRisk({
      callerNumber: '+1 512 555 1111',
      calledNumber: '+1 512 555 0148',
      transcriptText: 'dinner reservation confirmation'
    }).riskLevel,
    'low'
  );
});

test('MockCarrierAdapter provisions and activates a customer SIM', () => {
  wirelessOsService.resetDemoData();
  const customer = wirelessOsService.getCustomer('demo@pacmac.com');
  const sim = mockCarrierAdapter.provisionSim(customer, 'eSIM');
  const line = mockCarrierAdapter.activateSim(sim.id);
  const updated = wirelessOsService.getCustomer(customer.id);

  assert.equal(sim.type, 'eSIM');
  assert.equal(line.status, 'active');
  assert.equal(updated.simStatus, 'active');
});

test('high-risk PackieAI calls auto-block the caller', () => {
  wirelessOsService.resetDemoData();
  const customer = wirelessOsService.getCustomer('demo@pacmac.com');
  const alert = wirelessOsService.handleIncomingCall({
    callerNumber: '+1 888 555 0198',
    calledNumber: customer.phoneNumber,
    transcriptText: 'urgent payment required by gift card'
  });
  const state = wirelessOsService.getState();

  assert.equal(alert.riskLevel, 'high');
  assert.equal(alert.action, 'blocked');
  assert.ok(state.blockedNumbers.some((blocked) => blocked.phoneNumber === '+1 888 555 0198'));
});

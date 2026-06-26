import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  createLifelineLead,
  listLifelineLeads,
  resetMemoryLifelineLeadsForTests
} from '../server/pacmacBackend.ts';

const nationalVerifierUrl = 'https://www.getinternet.gov/apply?id=nv_home&ln=RW5nbGlzaA%3D%3D';
const nebraskaPscUrl = 'https://psc.nebraska.gov/nebraska-telephone-assistance-programlifeline';

test('/lifeline page is routed and footer includes Lifeline / NTAP link', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8');

  assert.match(app, /path="\/lifeline"/);
  assert.match(footer, /Lifeline \/ NTAP/);
  assert.match(footer, /PacMac Mobile is not a government agency/);
});

test('Lifeline page uses official National Verifier and Nebraska PSC URLs', () => {
  const lifeline = readFileSync(new URL('../src/pages/Lifeline.tsx', import.meta.url), 'utf8');

  assert.match(lifeline, new RegExp(nationalVerifierUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(lifeline, new RegExp(nebraskaPscUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(lifeline, /Verify Eligibility on GetInternet\.gov/);
  assert.match(lifeline, /View Nebraska NTAP Details/);
});

test('Lifeline lead form requires consent before saving', async () => {
  resetMemoryLifelineLeadsForTests();
  const result = await createLifelineLead({
    fullName: 'Nebraska User',
    email: 'nebraska@example.com',
    phone: '+1 402 555 0101',
    eligibilityStatus: 'I need help finishing',
    consent: false
  });

  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.status, 400);
  assert.equal((await listLifelineLeads()).length, 0);
});

test('Lifeline lead form saves safe contact info', async () => {
  resetMemoryLifelineLeadsForTests();
  const result = await createLifelineLead({
    fullName: 'Nebraska User',
    email: 'NEBRASKA@example.com',
    phone: '+1 402 555 0101',
    eligibilityStatus: 'I was approved',
    consent: true
  });
  const leads = await listLifelineLeads();

  assert.equal(result.ok, true);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].email, 'nebraska@example.com');
  assert.equal(leads[0].source, 'lifeline_page');
  assert.equal(leads[0].consent, true);
});

test('Lifeline flow does not collect sensitive document or SSN fields', () => {
  const lifeline = readFileSync(new URL('../src/pages/Lifeline.tsx', import.meta.url), 'utf8');
  const backend = readFileSync(new URL('../server/pacmacBackend.ts', import.meta.url), 'utf8');
  const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
  const schemaWithoutComments = schema.replace(/--.*$/gm, '');

  assert.doesNotMatch(lifeline + backend + schema, /name=["']?(ssn|socialSecurity|document|benefitCard|upload)/i);
  assert.doesNotMatch(schemaWithoutComments, /ssn|social_security|document_url|benefit_card|upload_url/i);
});

test('Lifeline language keeps PacMac as guide, not eligibility approver', () => {
  const lifeline = readFileSync(new URL('../src/pages/Lifeline.tsx', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8');

  assert.match(lifeline + home, /may qualify/);
  assert.match(lifeline, /help guide/);
  assert.match(lifeline, /official National Verifier/);
  assert.doesNotMatch(lifeline + home, /you are approved|guaranteed discount|PacMac approves Lifeline|free government phone/i);
});

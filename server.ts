import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  billingEstimateForCustomer,
  blockNumber,
  clearSessionCookie,
  getCustomerDashboard,
  getSeedSummary,
  getSessionUser,
  createLifelineLead,
  formatWaitlistResponse,
  joinWaitlist,
  listLifelineLeads,
  listWaitlist,
  login,
  sessionCookie,
  setPackieProtection,
  signup,
  unblockNumber
} from './server/pacmacBackend';
import {
  deviceLookupService,
  formatByopApiResponse,
  listByopChecks
} from './server/deviceLookupService';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const resendApiKey = process.env.RESEND_API_KEY;

function validateServerStartup() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;
  const keyExists = !!resendApiKey;

  console.log('\n=== [PacMac System Diagnostics] ===');
  console.log(`Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`Target Port: ${port}`);
  
  if (!keyExists) {
    if (isProd) {
      console.error('❌ FATAL CONFIGURATION ERROR:');
      console.error('   RESEND_API_KEY is not defined in the host environment.');
      console.error('   In production, email delivery functions are mandatory for magic links.');
      console.error('   Startup aborted.');
      console.log('====================================\n');
      process.exit(1);
    } else {
      console.warn('⚠️  CONFIG WARNING:');
      console.warn('   RESEND_API_KEY is missing from local configuration settings.');
      console.warn('   Outbound email features will fall back to stdout/terminal logs.');
    }
  } else {
    console.log('✔ RESEND_API_KEY: Configured successfully');
  }
  console.log('====================================\n');
}

app.use(express.json());

function requireSession(req: express.Request, res: express.Response) {
  const user = getSessionUser(req.headers.cookie);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  return user;
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const result = await login(email, password);
  if (!result.ok) return res.status(401).json({ error: result.error });
  res.setHeader('Set-Cookie', sessionCookie(result.token));
  return res.status(200).json({ user: result.user });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, phoneNumber } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const result = await signup({ name, email, password, phoneNumber });
  if (!result.ok) return res.status(409).json({ error: result.error });
  res.setHeader('Set-Cookie', sessionCookie(result.token));
  return res.status(201).json({ user: result.user });
});

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearSessionCookie());
  return res.status(200).json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  return res.status(200).json({ user: getSessionUser(req.headers.cookie) });
});

app.get('/api/customer/dashboard', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = await getCustomerDashboard(user);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json(result.data);
});

app.get('/api/customer/usage-events', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = await getCustomerDashboard(user);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json({ usageEvents: result.data.usageEvents });
});

app.get('/api/customer/billing-estimate', async (req, res) => {
  const user = requireSession(req, res);
  if (!user?.customerId) return res.status(403).json({ error: 'Customer access required.' });
  return res.status(200).json({ billingEstimate: await billingEstimateForCustomer(user.customerId) });
});

app.patch('/api/customer/packie-protection', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = await setPackieProtection(user, Boolean(req.body?.enabled));
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json(result);
});

app.post('/api/customer/blocked-numbers', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required.' });
  const result = await blockNumber(user, phoneNumber);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(201).json(result);
});

app.delete('/api/customer/blocked-numbers/:id', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = await unblockNumber(user, req.params.id);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json({ ok: true });
});

app.get('/api/admin/seed-summary', (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  return res.status(200).json(getSeedSummary());
});

app.get('/api/admin/waitlist', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  const entries = await listWaitlist();
  return res.status(200).json({ success: true, total: entries.length, entries });
});

app.get('/api/admin/byop-checks', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  const checks = await listByopChecks();
  return res.status(200).json({ success: true, total: checks.length, checks });
});

app.get('/api/admin/lifeline-leads', async (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  const leads = await listLifelineLeads();
  return res.status(200).json({ success: true, total: leads.length, leads });
});

app.post('/api/waitlist', async (req, res) => {
  const result = await joinWaitlist({
    fullName: req.body?.full_name || req.body?.fullName || req.body?.name,
    phone: req.body?.phone,
    email: req.body?.email
  });
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json(formatWaitlistResponse(result));
});

app.post('/api/lifeline/leads', async (req, res) => {
  const result = await createLifelineLead({
    fullName: req.body?.full_name || req.body?.fullName || req.body?.name,
    email: req.body?.email,
    phone: req.body?.phone,
    eligibilityStatus: req.body?.eligibility_status || req.body?.eligibilityStatus,
    consent: req.body?.consent
  });
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(201).json({ success: true, lead: result.lead });
});

app.post('/api/byop/check-imei', async (req, res) => {
  const result = await deviceLookupService.check_byop_compatibility(req.body?.imei || '');
  return res.status(result.imei_valid ? 200 : 400).json(formatByopApiResponse(result));
});

type ServerRiskLevel = 'low' | 'medium' | 'high';

const serverBlockedNumbers = new Map<string, Set<string>>();
const serverFraudAlerts: any[] = [];

function analyzePackieCall(payload: any): { riskLevel: ServerRiskLevel; notes: string } {
  const text = `${payload.callerNumber || ''} ${payload.transcriptText || ''} ${payload.transcriptUrl || ''}`.toLowerCase();
  const highRiskTerms = ['gift card', 'wire transfer', 'crypto', 'password', 'social security', 'bank login', 'urgent payment'];
  const mediumRiskTerms = ['verify account', 'carrier support', 'limited time', 'unknown caller', 'payment issue'];

  if (highRiskTerms.some((term) => text.includes(term)) || String(payload.callerNumber || '').includes('888')) {
    return { riskLevel: 'high', notes: 'High-risk scam indicators detected by PackieAI mock analyzer.' };
  }

  if (mediumRiskTerms.some((term) => text.includes(term)) || String(payload.callerNumber || '').includes('866')) {
    return { riskLevel: 'medium', notes: 'Medium-risk social-engineering pattern detected by PackieAI mock analyzer.' };
  }

  return { riskLevel: 'low', notes: 'No material scam indicators detected by PackieAI mock analyzer.' };
}

function customerKey(req: express.Request) {
  return String(req.headers['x-pacmac-customer-id'] || req.body?.customerId || req.query.customerId || 'demo@pacmac.com');
}

// Secure API endpoint for email sending
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  if (!resendApiKey) {
    return res.status(500).json({ 
      error: 'RESEND_API_KEY is not configured on the production host server.',
      code: 'MISSING_API_KEY'
    });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PacMac Mobile <onboarding@resend.dev>',
        to,
        subject,
        html
      })
    });

    const resendData = await resendRes.json() as any;

    if (resendRes.ok) {
      return res.status(200).json({ success: true, id: resendData.id });
    } else {
      return res.status(resendRes.status).json({ 
        error: resendData.message || 'Resend API rejected the email request.',
        details: resendData
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal connection failure' });
  }
});

// PackieAI webhook-ready mock endpoint. Future production code should verify
// voice-provider signatures here before trusting payloads.
app.post('/webhooks/incoming-call', (req, res) => {
  const { callerNumber, calledNumber } = req.body || {};
  if (!callerNumber || !calledNumber) {
    return res.status(400).json({ error: 'Missing callerNumber or calledNumber' });
  }

  const analysis = analyzePackieCall(req.body);
  const key = String(calledNumber);
  const shouldBlock = analysis.riskLevel === 'high';
  const alert = {
    id: `fraud_${Date.now()}`,
    customerId: key,
    callerNumber,
    calledNumber,
    riskLevel: analysis.riskLevel,
    action: shouldBlock ? 'blocked' : analysis.riskLevel === 'medium' ? 'warned' : 'allowed',
    transcriptUrl: req.body.transcriptUrl,
    audioUrl: req.body.audioUrl,
    notes: analysis.notes,
    createdAt: req.body.timestamp || new Date().toISOString()
  };

  serverFraudAlerts.unshift(alert);
  if (shouldBlock) {
    const blocked = serverBlockedNumbers.get(key) || new Set<string>();
    blocked.add(callerNumber);
    serverBlockedNumbers.set(key, blocked);
  }

  return res.status(200).json(alert);
});

app.post('/webhooks/call-analysis', (req, res) => {
  return res.status(200).json(analyzePackieCall(req.body || {}));
});

app.get('/customer/fraud-alerts', (req, res) => {
  const key = customerKey(req);
  return res.status(200).json(serverFraudAlerts.filter((alert) => alert.customerId === key || alert.calledNumber === key));
});

app.post('/customer/block-number', (req, res) => {
  const key = customerKey(req);
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) return res.status(400).json({ error: 'Missing phoneNumber' });
  const blocked = serverBlockedNumbers.get(key) || new Set<string>();
  blocked.add(phoneNumber);
  serverBlockedNumbers.set(key, blocked);
  return res.status(200).json({ customerId: key, phoneNumber, blocked: true });
});

app.post('/customer/unblock-number', (req, res) => {
  const key = customerKey(req);
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) return res.status(400).json({ error: 'Missing phoneNumber' });
  const blocked = serverBlockedNumbers.get(key) || new Set<string>();
  blocked.delete(phoneNumber);
  serverBlockedNumbers.set(key, blocked);
  return res.status(200).json({ customerId: key, phoneNumber, blocked: false });
});

// Serve static assets from Vite build output directory (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all routes to index.html for Single Page App routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Run startup diagnostics validation before server boot
validateServerStartup();

app.listen(PORT, () => {
  console.log(`[PacMac Production Server] Running on http://localhost:${PORT}`);
});

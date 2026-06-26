import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import {
  billingEstimateForCustomer,
  blockNumber,
  clearSessionCookie,
  getCustomerDashboard,
  getSeedSummary,
  getSessionUser,
  joinWaitlist,
  login,
  sessionCookie,
  setPackieProtection,
  signup,
  unblockNumber
} from './server/pacmacBackend';

export default defineConfig(({ mode }) => {
  // Load environment variables (from .env.local, .env, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  process.env.SUPABASE_URL ||= env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.JWT_SECRET ||= env.JWT_SECRET;

  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-server-endpoints',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const sendJson = (status: number, payload: unknown, cookie?: string) => {
              res.statusCode = status;
              res.setHeader('Content-Type', 'application/json');
              if (cookie) res.setHeader('Set-Cookie', cookie);
              res.end(JSON.stringify(payload));
            };

            const readBody = async () => new Promise<any>((resolve) => {
              let data = '';
              req.on('data', chunk => { data += chunk; });
              req.on('end', () => {
                try { resolve(data ? JSON.parse(data) : {}); }
                catch { resolve({}); }
              });
            });

            const currentUser = () => getSessionUser(req.headers.cookie);

            if (req.url === '/api/auth/login' && req.method === 'POST') {
              const body = await readBody();
              if (!body.email || !body.password) return sendJson(400, { error: 'Email and password are required.' });
              const result = await login(body.email, body.password);
              if (!result.ok) return sendJson(401, { error: result.error });
              return sendJson(200, { user: result.user }, sessionCookie(result.token));
            }

            if (req.url === '/api/auth/signup' && req.method === 'POST') {
              const body = await readBody();
              if (!body.name || !body.email || !body.password) return sendJson(400, { error: 'Name, email, and password are required.' });
              if (String(body.password).length < 8) return sendJson(400, { error: 'Password must be at least 8 characters.' });
              const result = await signup(body);
              if (!result.ok) return sendJson(409, { error: result.error });
              return sendJson(201, { user: result.user }, sessionCookie(result.token));
            }

            if (req.url === '/api/auth/logout' && req.method === 'POST') {
              return sendJson(200, { ok: true }, clearSessionCookie());
            }

            if (req.url === '/api/auth/me' && req.method === 'GET') {
              return sendJson(200, { user: currentUser() });
            }

            if (req.url === '/api/customer/dashboard' && req.method === 'GET') {
              const user = currentUser();
              if (!user) return sendJson(401, { error: 'Authentication required.' });
              const result = await getCustomerDashboard(user);
              if (!result.ok) return sendJson(result.status, { error: result.error });
              return sendJson(200, result.data);
            }

            if (req.url === '/api/customer/usage-events' && req.method === 'GET') {
              const user = currentUser();
              if (!user) return sendJson(401, { error: 'Authentication required.' });
              const result = await getCustomerDashboard(user);
              if (!result.ok) return sendJson(result.status, { error: result.error });
              return sendJson(200, { usageEvents: result.data.usageEvents });
            }

            if (req.url === '/api/customer/billing-estimate' && req.method === 'GET') {
              const user = currentUser();
              if (!user?.customerId) return sendJson(403, { error: 'Customer access required.' });
              return sendJson(200, { billingEstimate: await billingEstimateForCustomer(user.customerId) });
            }

            if (req.url === '/api/customer/packie-protection' && req.method === 'PATCH') {
              const user = currentUser();
              if (!user) return sendJson(401, { error: 'Authentication required.' });
              const body = await readBody();
              const result = await setPackieProtection(user, Boolean(body.enabled));
              if (!result.ok) return sendJson(result.status, { error: result.error });
              return sendJson(200, result);
            }

            if (req.url === '/api/customer/blocked-numbers' && req.method === 'POST') {
              const user = currentUser();
              if (!user) return sendJson(401, { error: 'Authentication required.' });
              const body = await readBody();
              if (!body.phoneNumber) return sendJson(400, { error: 'Phone number is required.' });
              const result = await blockNumber(user, body.phoneNumber);
              if (!result.ok) return sendJson(result.status, { error: result.error });
              return sendJson(201, result);
            }

            if (req.url?.startsWith('/api/customer/blocked-numbers/') && req.method === 'DELETE') {
              const user = currentUser();
              if (!user) return sendJson(401, { error: 'Authentication required.' });
              const blockedNumberId = decodeURIComponent(req.url.split('/').pop() || '');
              const result = await unblockNumber(user, blockedNumberId);
              if (!result.ok) return sendJson(result.status, { error: result.error });
              return sendJson(200, { ok: true });
            }

            if (req.url === '/api/admin/seed-summary' && req.method === 'GET') {
              const user = currentUser();
              if (!user) return sendJson(401, { error: 'Authentication required.' });
              if (user.role !== 'admin') return sendJson(403, { error: 'Admin access required.' });
              return sendJson(200, getSeedSummary());
            }

            if (req.url === '/api/waitlist' && req.method === 'POST') {
              const body = await readBody();
              const result = await joinWaitlist({ name: body.name, email: body.email });
              if (!result.ok) return sendJson(result.status, { error: result.error });
              return sendJson(201, result.entry);
            }

            // Secure server-side mail sending endpoint
            if (req.url === '/api/send-email' && req.method === 'POST') {
              res.setHeader('Content-Type', 'application/json');
              
              // Helper to parse JSON body from incoming Node request stream
              const body = await readBody();

              const { to, subject, html } = body;

              if (!to || !subject || !html) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required fields: to, subject, html' }));
                return;
              }

              if (!resendApiKey) {
                res.statusCode = 500;
                res.end(JSON.stringify({ 
                  error: 'RESEND_API_KEY is not configured on the host server.',
                  code: 'MISSING_API_KEY'
                }));
                return;
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

                const resendData = await resendRes.json();

                if (resendRes.ok) {
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, id: resendData.id }));
                } else {
                  res.statusCode = resendRes.status;
                  res.end(JSON.stringify({ 
                    error: resendData.message || 'Resend API rejected the email request.',
                    details: resendData
                  }));
                }
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message || 'Internal connection failure' }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

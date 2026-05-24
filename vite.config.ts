import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables (from .env.local, .env, etc.)
  const env = loadEnv(mode, process.cwd(), '');
  const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;

  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-server-endpoints',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            // Secure server-side mail sending endpoint
            if (req.url === '/api/send-email' && req.method === 'POST') {
              res.setHeader('Content-Type', 'application/json');
              
              // Helper to parse JSON body from incoming Node request stream
              const body = await new Promise<any>((resolve) => {
                let data = '';
                req.on('data', chunk => { data += chunk; });
                req.on('end', () => {
                  try { resolve(JSON.parse(data)); }
                  catch { resolve({}); }
                });
              });

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

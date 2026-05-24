import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

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

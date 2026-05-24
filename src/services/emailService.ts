export const emailService = {
  async sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error: string | null; code?: string }> {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to, subject, html })
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, error: null };
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to dispatch email.',
          code: data.code
        };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message || 'Failed to reach API server endpoint.' 
      };
    }
  },

  async sendMagicLink(email: string, code: string, link: string): Promise<{ success: boolean; error: string | null; code?: string }> {
    const subject = "Your PacMac Mobile Magic Passcode";
    const html = `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #111;">
        <h2 style="font-weight: 600; font-size: 24px; border-bottom: 1px solid #222; padding-bottom: 20px;">PacMac Mobile</h2>
        <p style="color: #a0a0a0; font-size: 14px; margin-top: 20px; font-weight: 300;">
          Use the secure passcode below to complete your login or activation.
        </p>
        <div style="margin: 30px 0; background-color: #0c0c0c; border: 1px solid #222; padding: 20px; text-align: center; border-radius: 6px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #fff;">${code}</span>
        </div>
        <p style="color: #a0a0a0; font-size: 14px; font-weight: 300;">
          Alternatively, click the link below to sign in automatically:
        </p>
        <p style="margin: 25px 0;">
          <a href="${link}" style="display: inline-block; background-color: #fff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">
            Sign in to Dashboard
          </a>
        </p>
        <span style="display: block; border-top: 1px solid #222; padding-top: 20px; color: #555; font-size: 10px; font-family: monospace;">
          Security notice: This code will expire shortly. Do not share this with anyone.
        </span>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  },

  async sendDiagnosticsTest(email: string): Promise<{ success: boolean; error: string | null; code?: string }> {
    const subject = "PacMac SMTP Connection Diagnostics";
    const html = `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #111;">
        <h2 style="font-weight: 600; font-size: 22px; border-bottom: 1px solid #222; padding-bottom: 20px; color: #22c55e;">✓ Connection Secure</h2>
        <p style="color: #a0a0a0; font-size: 14px; margin-top: 20px; font-weight: 300;">
          This is an automated diagnostic test to confirm your Resend SMTP / API config is operational.
        </p>
        <div style="margin: 20px 0; background-color: #166534/20; border: 1px solid #15803d/30; padding: 15px; border-radius: 6px; color: #4ade80; font-size: 13px;">
          Resend SMTP route: <strong>smtp.resend.com:465 (Operational)</strong>
        </div>
        <span style="display: block; border-top: 1px solid #222; padding-top: 20px; color: #555; font-size: 10px; font-family: monospace;">
          Diagnostics timestamp: ${new Date().toUTCString()}
        </span>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }
};

# PacMac Mobile - Production Deployment & Hardening Guide

This document details the configuration, build, security verification, and startup processes required to deploy the PacMac platform to a public cloud or physical Linux host.

---

## 1. Environment Setup Instructions

The application requires specific environment variables depending on the host mode.

### Server Host Configuration
Create a `.env` file in the project root directory on the production server.

```ini
# Server Configuration
PORT=3000
NODE_ENV=production

# Email Gateway Integration (Mandatory in Production)
# Obtain a secret key from https://resend.com
RESEND_API_KEY=re_your_production_secret_key
```

### Client Frontend Configuration
Vite builds environment tokens into the compiled index bundle. Ensure these are defined in your build environment before running `npm run build`.

```ini
# Supabase Production API Links
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

# Security Flags (Must be false/disabled in production)
VITE_DEV_AUTH_BYPASS=false
```

---

## 2. Build Instructions

To bundle the application for production, compile the TypeScript source files and pack assets using Vite and ESBuild:

```bash
# 1. Install production dependencies
npm install

# 2. Run lint/compilation checks
npm run lint

# 3. Build client files and node server bundle
npm run build
```

This output generates the following assets:
- `dist/`: Compressed HTML, CSS, and dynamic client routing modules.
- `server.js`: Bundled production Node.js Express server.

---

## 3. Startup Commands

### Direct Node.js Boot
To launch the verified Express server directly using Node:

```bash
NODE_ENV=production node server.js
```

### Process Management with PM2 (Recommended)
For automatic restart on crashes, zero-downtime clustering, log consolidation, and background persistence, use PM2 with our root configuration template:

```bash
# Install PM2 globally
npm install -g pm2

# Start the cluster with ecosystem.config.json configurations
pm2 start ecosystem.config.json

# Enable boot-up daemon persistence across server restarts
pm2 save
pm2 startup
```

---

## 4. Reverse Proxy Configuration

To expose the application securely on port 80/443, configure Nginx using the verified production configuration template `pacmac.nginx.conf` provided in the project root.

### Applying Nginx Template Configuration
1. Copy the configuration template to your Nginx sites directory:
   ```bash
   sudo cp pacmac.nginx.conf /etc/nginx/sites-available/pacmac
   ```
2. Enable the site by symlinking it to `sites-enabled`:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pacmac /etc/nginx/sites-enabled/
   ```
3. Test and reload the Nginx daemon:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 5. HTTPS Configuration & Let's Encrypt Setup

Production authentication flows require HTTPS for cookie security and secure network transmissions.

### Certbot SSL Setup (Nginx)
To obtain and install Let's Encrypt certificates using Certbot for `pacmacmobile.com`:

```bash
# Install certbot client
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Request and apply SSL certificate
sudo certbot --nginx -d pacmacmobile.com -d www.pacmacmobile.com
```

### Automatic HTTPS Redirects & HSTS
Our Nginx configuration handles redirects from HTTP to HTTPS, forces non-www domain canonicalization, and injects strict HSTS security headers.

---

## 6. Client Routing & Refresh Protection

The frontend uses `HashRouter` (`/#/dashboard`) rather than `BrowserRouter`.

### Why HashRouter?
- **Zero Configuration Fallbacks**: Because routing anchors are managed locally via hash changes (e.g. client-side location hashes), browser route refreshes *never* send sub-paths to the server.
- **Resilience**: Prevents the standard single-page app (SPA) blank-page or `404 Not Found` refresh crashes when serving from standard static hosts or reverse proxies.
- **Server Simplicity**: Server routes always fall back cleanly to `dist/index.html` via the wildcard redirect rule without requiring specialized URL rewrite engines.

---

## 7. Production Deployment Hardening Checklist

- [ ] **Secrets Leaks**: Verify that no production passwords, Supabase database passwords, or Resend API tokens are committed to source files.
- [ ] **Bypass Locks**: Confirm `VITE_DEV_AUTH_BYPASS` is disabled. The client code is secured to ignore this parameter entirely when compiling in production mode.
- [ ] **Config Auditing**: Confirm the production server runs with `NODE_ENV=production`. Verify the server exits immediately on startup with diagnostic outputs if `RESEND_API_KEY` is missing.
- [ ] **Admin Restricting**: Verify the `/admin` testing dashboard is conditionally compiled out of the client router in production.
- [ ] **Error Catcher**: Verify the React app is mounted inside a global `ErrorBoundary` to intercept runtime rendering failures gracefully.

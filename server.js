// server.ts
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// server/pacmacBackend.ts
import crypto from "crypto";
var SESSION_COOKIE = "pacmac_session";
var JWT_SECRET = process.env.JWT_SECRET || "pacmac-local-development-secret-change-me";
var PRICE_PER_GB = Number(process.env.PRICE_PER_GB || process.env.VITE_PRICE_PER_GB || 3);
var MONTHLY_CAP = Number(process.env.MONTHLY_CAP || process.env.VITE_MONTHLY_CAP || 30);
function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}
function fromBase64Url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const passwordHash = crypto.pbkdf2Sync(password, salt, 12e4, 32, "sha256").toString("hex");
  return { passwordHash, passwordSalt: salt };
}
function verifyPassword(password, user) {
  const candidate = hashPassword(password, user.passwordSalt).passwordHash;
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(user.passwordHash, "hex"));
}
function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    customerId: user.customerId
  };
}
function createJwt(user) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId: user.customerId,
      exp: Math.floor(Date.now() / 1e3) + 60 * 60 * 8
    })
  );
  const signature = base64Url(crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}
function verifyJwt(token) {
  if (!token) return null;
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const expected = base64Url(crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest());
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const parsed = JSON.parse(fromBase64Url(payload));
  if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1e3)) return null;
  return {
    id: parsed.sub,
    email: parsed.email,
    name: parsed.name,
    role: parsed.role,
    customerId: parsed.customerId
  };
}
function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey) acc[rawKey] = decodeURIComponent(rawValue.join("=") || "");
    return acc;
  }, {});
}
function sessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 8}`;
}
function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
function currentCycle() {
  const now = /* @__PURE__ */ new Date();
  const startsAt = new Date(now.getFullYear(), now.getMonth(), 1);
  const endsAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
}
var customerPassword = hashPassword("password123", "pacmac_customer_seed_salt");
var adminPassword = hashPassword("admin123", "pacmac_admin_seed_salt");
var cycle = currentCycle();
var users = [
  {
    id: "usr_customer_seed",
    email: "customer@pacmacmobile.com",
    name: "Maya Chen",
    role: "customer",
    customerId: "cus_seed_customer",
    ...customerPassword
  },
  {
    id: "usr_admin_seed",
    email: "admin@pacmacmobile.com",
    name: "PacMac Staff",
    role: "admin",
    ...adminPassword
  }
];
var customers = [
  {
    id: "cus_seed_customer",
    name: "Maya Chen",
    email: "customer@pacmacmobile.com",
    phoneNumber: "+1 512 555 0148",
    accountStatus: "active",
    simStatus: "active",
    fraudProtectionStatus: "enabled",
    billingCycle: {
      id: "cycle_seed_customer_current",
      ...cycle
    },
    line: {
      id: "line_seed_customer",
      phoneNumber: "+1 512 555 0148",
      status: "active",
      simType: "eSIM",
      iccid: "89014103211118510042"
    }
  }
];
var usageEvents = [
  { id: "usage_1", customerId: "cus_seed_customer", gbUsed: 2.1, source: "carrier_mock", createdAt: new Date(Date.now() - 864e5 * 5).toISOString() },
  { id: "usage_2", customerId: "cus_seed_customer", gbUsed: 1.8, source: "carrier_mock", createdAt: new Date(Date.now() - 864e5 * 3).toISOString() },
  { id: "usage_3", customerId: "cus_seed_customer", gbUsed: 4.5, source: "carrier_mock", createdAt: new Date(Date.now() - 864e5).toISOString() }
];
var fraudAlerts = [
  {
    id: "fraud_1",
    customerId: "cus_seed_customer",
    callerNumber: "+1 888 555 0199",
    riskLevel: "high",
    action: "blocked",
    notes: "PackieAI detected payment-pressure language and blocked the caller.",
    createdAt: new Date(Date.now() - 864e5 * 2).toISOString()
  },
  {
    id: "fraud_2",
    customerId: "cus_seed_customer",
    callerNumber: "+1 866 555 0120",
    riskLevel: "medium",
    action: "warned",
    notes: "Possible support impersonation. The call was flagged for review.",
    createdAt: new Date(Date.now() - 864e5).toISOString()
  }
];
var blockedNumbers = [
  {
    id: "block_1",
    customerId: "cus_seed_customer",
    phoneNumber: "+1 888 555 0199",
    reason: "PackieAI high-risk scam pattern",
    createdAt: new Date(Date.now() - 864e5 * 2).toISOString()
  },
  {
    id: "block_2",
    customerId: "cus_seed_customer",
    phoneNumber: "+1 877 555 0144",
    reason: "Customer blocked number",
    createdAt: new Date(Date.now() - 864e5 * 6).toISOString()
  }
];
function usageFor(customerId) {
  return usageEvents.filter((event) => event.customerId === customerId);
}
function billingEstimateFor(customerId) {
  const usageGb = usageFor(customerId).reduce((sum, event) => sum + event.gbUsed, 0);
  const estimatedCharge = Math.min(usageGb * PRICE_PER_GB, MONTHLY_CAP);
  return {
    usageGb: Math.round(usageGb * 100) / 100,
    pricePerGb: PRICE_PER_GB,
    monthlyCap: MONTHLY_CAP,
    estimatedCharge: Math.round(estimatedCharge * 100) / 100,
    capProgress: Math.min(100, Math.round(estimatedCharge / MONTHLY_CAP * 100))
  };
}
function login(email, password) {
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user)) {
    return { ok: false, error: "Invalid email or password." };
  }
  const safeUser = publicUser(user);
  return { ok: true, user: safeUser, token: createJwt(safeUser) };
}
function signup(input) {
  if (users.some((user2) => user2.email.toLowerCase() === input.email.toLowerCase())) {
    return { ok: false, error: "An account already exists for this email." };
  }
  const customerId = `cus_${crypto.randomUUID()}`;
  const userId = `usr_${crypto.randomUUID()}`;
  const password = hashPassword(input.password);
  const customer = {
    id: customerId,
    name: input.name,
    email: input.email.toLowerCase(),
    phoneNumber: input.phoneNumber || "+1 555 555 0101",
    accountStatus: "pending_activation",
    simStatus: "provisioned",
    fraudProtectionStatus: "enabled",
    billingCycle: {
      id: `cycle_${customerId}_current`,
      ...currentCycle()
    },
    line: {
      id: `line_${customerId}`,
      phoneNumber: input.phoneNumber || "+1 555 555 0101",
      status: "provisioned",
      simType: "eSIM",
      iccid: `8901410${Math.floor(Math.random() * 1e10)}`
    }
  };
  const user = {
    id: userId,
    email: input.email.toLowerCase(),
    name: input.name,
    role: "customer",
    customerId,
    ...password
  };
  users.push(user);
  customers.push(customer);
  const safeUser = publicUser(user);
  return { ok: true, user: safeUser, token: createJwt(safeUser) };
}
function getSessionUser(cookieHeader) {
  return verifyJwt(parseCookies(cookieHeader)[SESSION_COOKIE]);
}
function getCustomerDashboard(user) {
  if (user.role !== "customer" || !user.customerId) {
    return { ok: false, status: 403, error: "Customer access required." };
  }
  const customer = customers.find((item) => item.id === user.customerId);
  if (!customer) return { ok: false, status: 404, error: "Customer profile not found." };
  return {
    ok: true,
    data: {
      customer,
      usageEvents: usageFor(customer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      billingEstimate: billingEstimateFor(customer.id),
      fraudAlerts: fraudAlerts.filter((alert) => alert.customerId === customer.id),
      blockedNumbers: blockedNumbers.filter((blocked) => blocked.customerId === customer.id),
      accountSettings: {
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        role: user.role,
        paperlessBilling: true,
        autopay: false
      }
    }
  };
}
function setPackieProtection(user, enabled) {
  const customer = customers.find((item) => item.id === user.customerId);
  if (!customer) return { ok: false, status: 404, error: "Customer profile not found." };
  customer.fraudProtectionStatus = enabled ? "enabled" : "disabled";
  return { ok: true, fraudProtectionStatus: customer.fraudProtectionStatus };
}
function blockNumber(user, phoneNumber) {
  if (!user.customerId) return { ok: false, status: 403, error: "Customer access required." };
  const existing = blockedNumbers.find((item) => item.customerId === user.customerId && item.phoneNumber === phoneNumber);
  if (existing) return { ok: true, blockedNumber: existing };
  const blockedNumber = {
    id: `block_${crypto.randomUUID()}`,
    customerId: user.customerId,
    phoneNumber,
    reason: "Customer blocked number",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  blockedNumbers.unshift(blockedNumber);
  return { ok: true, blockedNumber };
}
function unblockNumber(user, blockedNumberId) {
  const index = blockedNumbers.findIndex((item) => item.id === blockedNumberId && item.customerId === user.customerId);
  if (index === -1) return { ok: false, status: 404, error: "Blocked number not found." };
  blockedNumbers.splice(index, 1);
  return { ok: true };
}
function getSeedSummary() {
  return {
    users: users.map(publicUser),
    customers,
    usageEvents,
    fraudAlerts,
    blockedNumbers
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
var resendApiKey = process.env.RESEND_API_KEY;
function validateServerStartup() {
  const isProd = process.env.NODE_ENV === "production";
  const port = process.env.PORT || 3e3;
  const keyExists = !!resendApiKey;
  console.log("\n=== [PacMac System Diagnostics] ===");
  console.log(`Environment: ${isProd ? "PRODUCTION" : "DEVELOPMENT"}`);
  console.log(`Target Port: ${port}`);
  if (!keyExists) {
    if (isProd) {
      console.error("\u274C FATAL CONFIGURATION ERROR:");
      console.error("   RESEND_API_KEY is not defined in the host environment.");
      console.error("   In production, email delivery functions are mandatory for magic links.");
      console.error("   Startup aborted.");
      console.log("====================================\n");
      process.exit(1);
    } else {
      console.warn("\u26A0\uFE0F  CONFIG WARNING:");
      console.warn("   RESEND_API_KEY is missing from local configuration settings.");
      console.warn("   Outbound email features will fall back to stdout/terminal logs.");
    }
  } else {
    console.log("\u2714 RESEND_API_KEY: Configured successfully");
  }
  console.log("====================================\n");
}
app.use(express.json());
function requireSession(req, res) {
  const user = getSessionUser(req.headers.cookie);
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return null;
  }
  return user;
}
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  const result = login(email, password);
  if (!result.ok) return res.status(401).json({ error: result.error });
  res.setHeader("Set-Cookie", sessionCookie(result.token));
  return res.status(200).json({ user: result.user });
});
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password, phoneNumber } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required." });
  if (String(password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  const result = signup({ name, email, password, phoneNumber });
  if (!result.ok) return res.status(409).json({ error: result.error });
  res.setHeader("Set-Cookie", sessionCookie(result.token));
  return res.status(201).json({ user: result.user });
});
app.post("/api/auth/logout", (_req, res) => {
  res.setHeader("Set-Cookie", clearSessionCookie());
  return res.status(200).json({ ok: true });
});
app.get("/api/auth/me", (req, res) => {
  return res.status(200).json({ user: getSessionUser(req.headers.cookie) });
});
app.get("/api/customer/dashboard", (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = getCustomerDashboard(user);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json(result.data);
});
app.get("/api/customer/usage-events", (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = getCustomerDashboard(user);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json({ usageEvents: result.data.usageEvents });
});
app.get("/api/customer/billing-estimate", (req, res) => {
  const user = requireSession(req, res);
  if (!user?.customerId) return res.status(403).json({ error: "Customer access required." });
  return res.status(200).json({ billingEstimate: billingEstimateFor(user.customerId) });
});
app.patch("/api/customer/packie-protection", (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = setPackieProtection(user, Boolean(req.body?.enabled));
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json(result);
});
app.post("/api/customer/blocked-numbers", (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) return res.status(400).json({ error: "Phone number is required." });
  const result = blockNumber(user, phoneNumber);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(201).json(result);
});
app.delete("/api/customer/blocked-numbers/:id", (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  const result = unblockNumber(user, req.params.id);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json({ ok: true });
});
app.get("/api/admin/seed-summary", (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;
  if (user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  return res.status(200).json(getSeedSummary());
});
var serverBlockedNumbers = /* @__PURE__ */ new Map();
var serverFraudAlerts = [];
function analyzePackieCall(payload) {
  const text = `${payload.callerNumber || ""} ${payload.transcriptText || ""} ${payload.transcriptUrl || ""}`.toLowerCase();
  const highRiskTerms = ["gift card", "wire transfer", "crypto", "password", "social security", "bank login", "urgent payment"];
  const mediumRiskTerms = ["verify account", "carrier support", "limited time", "unknown caller", "payment issue"];
  if (highRiskTerms.some((term) => text.includes(term)) || String(payload.callerNumber || "").includes("888")) {
    return { riskLevel: "high", notes: "High-risk scam indicators detected by PackieAI mock analyzer." };
  }
  if (mediumRiskTerms.some((term) => text.includes(term)) || String(payload.callerNumber || "").includes("866")) {
    return { riskLevel: "medium", notes: "Medium-risk social-engineering pattern detected by PackieAI mock analyzer." };
  }
  return { riskLevel: "low", notes: "No material scam indicators detected by PackieAI mock analyzer." };
}
function customerKey(req) {
  return String(req.headers["x-pacmac-customer-id"] || req.body?.customerId || req.query.customerId || "demo@pacmac.com");
}
app.post("/api/send-email", async (req, res) => {
  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields: to, subject, html" });
  }
  if (!resendApiKey) {
    return res.status(500).json({
      error: "RESEND_API_KEY is not configured on the production host server.",
      code: "MISSING_API_KEY"
    });
  }
  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "PacMac Mobile <onboarding@resend.dev>",
        to,
        subject,
        html
      })
    });
    const resendData = await resendRes.json();
    if (resendRes.ok) {
      return res.status(200).json({ success: true, id: resendData.id });
    } else {
      return res.status(resendRes.status).json({
        error: resendData.message || "Resend API rejected the email request.",
        details: resendData
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal connection failure" });
  }
});
app.post("/webhooks/incoming-call", (req, res) => {
  const { callerNumber, calledNumber } = req.body || {};
  if (!callerNumber || !calledNumber) {
    return res.status(400).json({ error: "Missing callerNumber or calledNumber" });
  }
  const analysis = analyzePackieCall(req.body);
  const key = String(calledNumber);
  const shouldBlock = analysis.riskLevel === "high";
  const alert = {
    id: `fraud_${Date.now()}`,
    customerId: key,
    callerNumber,
    calledNumber,
    riskLevel: analysis.riskLevel,
    action: shouldBlock ? "blocked" : analysis.riskLevel === "medium" ? "warned" : "allowed",
    transcriptUrl: req.body.transcriptUrl,
    audioUrl: req.body.audioUrl,
    notes: analysis.notes,
    createdAt: req.body.timestamp || (/* @__PURE__ */ new Date()).toISOString()
  };
  serverFraudAlerts.unshift(alert);
  if (shouldBlock) {
    const blocked = serverBlockedNumbers.get(key) || /* @__PURE__ */ new Set();
    blocked.add(callerNumber);
    serverBlockedNumbers.set(key, blocked);
  }
  return res.status(200).json(alert);
});
app.post("/webhooks/call-analysis", (req, res) => {
  return res.status(200).json(analyzePackieCall(req.body || {}));
});
app.get("/customer/fraud-alerts", (req, res) => {
  const key = customerKey(req);
  return res.status(200).json(serverFraudAlerts.filter((alert) => alert.customerId === key || alert.calledNumber === key));
});
app.post("/customer/block-number", (req, res) => {
  const key = customerKey(req);
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) return res.status(400).json({ error: "Missing phoneNumber" });
  const blocked = serverBlockedNumbers.get(key) || /* @__PURE__ */ new Set();
  blocked.add(phoneNumber);
  serverBlockedNumbers.set(key, blocked);
  return res.status(200).json({ customerId: key, phoneNumber, blocked: true });
});
app.post("/customer/unblock-number", (req, res) => {
  const key = customerKey(req);
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) return res.status(400).json({ error: "Missing phoneNumber" });
  const blocked = serverBlockedNumbers.get(key) || /* @__PURE__ */ new Set();
  blocked.delete(phoneNumber);
  serverBlockedNumbers.set(key, blocked);
  return res.status(200).json({ customerId: key, phoneNumber, blocked: false });
});
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
validateServerStartup();
app.listen(PORT, () => {
  console.log(`[PacMac Production Server] Running on http://localhost:${PORT}`);
});

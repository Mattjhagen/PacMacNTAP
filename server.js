// server.ts
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
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

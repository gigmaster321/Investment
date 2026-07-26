// ═══════════════════════════════════════════════════════════════════════════
// ecosystem.config.js — PM2 process configuration for Quantum Investments
//
// This file uses CommonJS syntax (module.exports) because PM2 reads it with
// require() regardless of the project's ESM setup.
//
// Usage:
//   pm2 start ecosystem.config.js --env production
//   pm2 reload ecosystem.config.js --env production   ← zero-downtime reload
//   pm2 delete quantum-api
// ═══════════════════════════════════════════════════════════════════════════
const path = require("path");

// Environment variables are injected by deploy.sh (source .env) before PM2
// starts. process.env is already populated when this file is evaluated.

module.exports = {
  apps: [
    {
      // ── Identity ───────────────────────────────────────────────────────────
      name: "quantum-api",
      script: path.join(__dirname, "artifacts/api-server/dist/index.mjs"),

      // Run as a single Node.js process.
      // On a 2 GB VPS a second worker doubles memory usage without meaningful
      // throughput gains for a single-tenant investment platform.
      instances: 1,
      exec_mode: "fork",

      // ESM: Node.js 20 handles .mjs natively — no extra flags needed.
      interpreter: "node",
      node_args: "",

      // ── Environment ────────────────────────────────────────────────────────
      env_production: {
        NODE_ENV: "production",
        PORT: "8080",
        // The PM2 process is the public-domain server behind Nginx.
        // Use an absolute path so the SPA is found regardless of PM2's cwd.
        FRONTEND_DIST_DIR: path.join(__dirname, "dist"),

        // DATABASE_URL, SESSION_SECRET, RESEND_API_KEY, EMAIL_FROM, LOG_LEVEL
        // are loaded from .env by deploy.sh before PM2 starts.
        // They are also declared explicitly here so PM2 exposes them to the
        // process even when starting without deploy.sh.
        DATABASE_URL:   process.env.DATABASE_URL   || "",
        SESSION_SECRET: process.env.SESSION_SECRET || "",
        RESEND_API_KEY: process.env.RESEND_API_KEY || "",
        EMAIL_FROM:     process.env.EMAIL_FROM     || "noreply@example.com",
        LOG_LEVEL:      process.env.LOG_LEVEL      || "info",
      },

      // Development env (not used on the VPS — kept for reference)
      env_development: {
        NODE_ENV: "development",
        PORT: "8080",
        DATABASE_URL: process.env.DATABASE_URL || "",
        SESSION_SECRET: "dev-secret-change-me",
        LOG_LEVEL: "debug",
      },

      // ── Reliability ────────────────────────────────────────────────────────
      // Restart the process if it uses more than 400 MB.
      // The bundled Express server sits at ~80–120 MB at rest; 400 MB gives
      // headroom for traffic spikes while protecting the 2 GB VPS.
      max_memory_restart: "400M",

      // Restart up to 10 times within 60 seconds before PM2 gives up.
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,     // Wait 3 s between crash restarts

      // ── Startup ────────────────────────────────────────────────────────────
      // Wait for the process to emit a 'ready' event or treat it as ready
      // after this many ms. The server's startup (session table creation +
      // admin seed) typically completes in < 3 s.
      wait_ready: false,
      listen_timeout: 8000,
      kill_timeout: 5000,      // Grace period before SIGKILL on stop/reload

      // ── Logging ────────────────────────────────────────────────────────────
      // Log to files in addition to the PM2 daemon log.
      // pm2-logrotate (installed by install.sh) rotates these automatically.
      out_file: "/var/log/pm2/quantum-api.out.log",
      error_file: "/var/log/pm2/quantum-api.error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // ── Misc ───────────────────────────────────────────────────────────────
      watch: false,          // Never watch files in production
      autorestart: true,     // Restart on crash
    },
  ],
};

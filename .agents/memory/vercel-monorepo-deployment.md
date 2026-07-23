---
name: Vercel monorepo deployment
description: Deployment configuration required for the Quantum Investments Vite app in this pnpm monorepo.
---

Vercel must use the repository root as its project root, run the workspace-specific Quantum Investments build, and serve the nested `artifacts/quantum-investments/dist/public` directory. Client-side routes require a catch-all rewrite to the generated `index.html`.

**Why:** The active repository previously had no Vercel configuration; the only SPA rewrite was inside a migration backup, so Vercel could build or serve the wrong directory and return 404s on the root or refreshed client routes.

**How to apply:** Keep the deployment settings in the root `vercel.json`, preserve the frozen pnpm install, and verify `artifacts/quantum-investments/dist/public/index.html` exists after every production build.
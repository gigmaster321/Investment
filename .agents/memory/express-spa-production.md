---
name: Express SPA production serving
description: Production topology for serving the Quantum Investments frontend and API behind one Nginx upstream.
---

The public-domain deployment proxies traffic to the Express process on port 8080. Express must serve the repository-root Vite build for `/`, static assets, and client-side routes only after mounting the existing `/api` and `/wp-json` routers.

**Why:** The VPS/PM2 topology sends the domain to the API process, so relying on a separate frontend server produces `Cannot GET /` even when the frontend build exists.

**How to apply:** Keep the frontend build available at the configured absolute `FRONTEND_DIST_DIR` (or the repository-root `dist/` fallback), preserve the API mounts before the SPA fallback, and build Node containers on glibc-based images because the workspace lockfile excludes Rollup’s musl binary.
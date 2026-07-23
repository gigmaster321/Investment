---
name: Investment plan persistence
description: Why the investment plan API currently uses in-memory state and how persistence is expected to evolve.
---

The investment plan management API is intentionally implemented as an in-memory adapter for now, with the REST contract and WordPress-compatible namespace kept stable for a later WordPress or database-backed adapter.

**Why:** The imported Quantum Investments project does not yet have a real application database schema, while the admin profile mutations already follow the same backend-ready in-memory pattern.

**How to apply:** Preserve the `/api/plans` and `/wp-json/quantum/v1/plans` response shapes when replacing the in-memory map with persistent storage; keep the shared frontend provider API unchanged.
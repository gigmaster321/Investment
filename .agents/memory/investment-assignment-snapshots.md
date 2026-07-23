---
name: Investment assignment snapshots
description: The durable rule for preserving investment terms when administrators edit future plan settings.
---

Each investment assignment must keep its own plan ID, plan name, execution cycle, and profit percentage snapshot. Changes to an investment plan apply only to future assignments and must not rewrite existing investment terms.

**Why:** Users need the expected return shown on an existing investment to remain stable even when administrators change the plan's future profit percentage or cycle.

**How to apply:** Preserve the snapshot fields in any future database or WordPress adapter, and keep user/admin responses based on the stored investment snapshot rather than resolving the current plan for historical records.
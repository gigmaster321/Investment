---
name: Imported artifact preview registration
description: Preview behavior to check when a GitHub import contains migration backups.
---

Imported Replit projects can contain both the live artifact and a `.migration-backup` copy. Artifact registration may initially be absent or report duplicate preview paths until the platform finishes indexing the imported metadata.

**Why:** The live app and workflow can be healthy while the artifact pane returns a proxy error or screenshot lookup says the artifact is missing.

**How to apply:** Check `listArtifacts()` and `listWorkflows()` before changing app code. Prefer the registered live artifact's managed workflow and its injected port; do not start the `.migration-backup` workflow.
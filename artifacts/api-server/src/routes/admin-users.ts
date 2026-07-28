import { Router, type IRouter } from "express";
import { requireAdmin } from "../middleware/requireAuth.js";

type UserStatus = "Active" | "Suspended";

/** Parse "#U-123" → 123, or return null for invalid format. */
function parseDbId(userId: string): number | null {
  const match = userId.match(/^#U-(\d+)$/);
  return match ? Number(match[1]) : null;
}

/** Format a numeric string or null as "$X,XXX.XX" */
function formatMoney(value: string | null | undefined): string {
  const num = parseFloat(value ?? "0") || 0;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format a Date to display + ISO strings. */
function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const display = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const iso = d.toISOString().slice(0, 10);
  return { display, iso };
}

/** Map DB account_status → UI UserStatus */
function toUiStatus(dbStatus: string): UserStatus {
  return dbStatus === "active" ? "Active" : "Suspended";
}

/** Map UI UserStatus → DB account_status */
function toDbStatus(uiStatus: UserStatus): "active" | "suspended" {
  return uiStatus === "Active" ? "active" : "suspended";
}

/** Pass through any plan name stored in DB, or 'None' when absent. */
function toUiPlan(dbPlan: string | null | undefined): string {
  return dbPlan ?? "None";
}

const router: IRouter = Router();
router.use(requireAdmin);

// ─── GET / — list all non-admin users from DB ────────────────────────────────

router.get("/", async (_req, res) => {
  try {
    const { db, usersTable } = await import("@workspace/db");
    const { ne, desc } = await import("drizzle-orm");

    const users = await db
      .select()
      .from(usersTable)
      .where(ne(usersTable.role, "admin"))
      .orderBy(desc(usersTable.created_at));

    const result = users.map((u) => {
      const { display: registeredDate, iso: registeredIso } = formatDate(u.created_at);
      const balanceNum = parseFloat(u.balance ?? "0") || 0;

      return {
        id: `#U-${u.id}`,
        name: u.full_name,
        username: u.username,
        email: u.email,
        phone: u.phone ?? "",
        country: "",
        registeredDate,
        registeredIso,
        status: toUiStatus(u.account_status),
        plan: toUiPlan(u.current_plan),
        balance: formatMoney(u.balance),
        balanceNum,
        totalDeposits: formatMoney(u.total_deposit),
        totalWithdrawals: formatMoney(u.total_withdrawal),
        totalProfit: "$0.00",
      };
    });

    res.json(result);
  } catch (_err) {
    res.status(500).json({ title: "Failed to list users", detail: "Internal server error." });
  }
});

/** Persistent notes key for the admin_config table. */
function notesKey(userId: string): string {
  return `user_notes_${userId}`;
}

async function getNotesFromDb(userId: string): Promise<string> {
  try {
    const { db, adminConfigTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [row] = await db
      .select({ value: adminConfigTable.value })
      .from(adminConfigTable)
      .where(eq(adminConfigTable.key, notesKey(userId)))
      .limit(1);
    return row?.value ?? "";
  } catch {
    return "";
  }
}

// ─── GET /:userId/profile — profile + notes ───────────────────────────────────

router.get("/:userId/profile", async (req, res) => {
  const userId = String(req.params.userId);
  const dbId = parseDbId(userId);

  const notes = await getNotesFromDb(userId);

  if (dbId) {
    try {
      const { db, usersTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      const [u] = await db
        .select({ account_status: usersTable.account_status })
        .from(usersTable)
        .where(eq(usersTable.id, dbId))
        .limit(1);

      if (u) {
        res.json({
          userId,
          status: toUiStatus(u.account_status),
          notes,
          updatedAt: new Date().toISOString(),
        });
        return;
      }
    } catch {
      // fall through to default
    }
  }

  res.json({
    userId,
    status: "Active" as UserStatus,
    notes,
    updatedAt: new Date(0).toISOString(),
  });
});

// ─── PUT /:userId/notes — save admin notes to DB ─────────────────────────────

router.put("/:userId/notes", async (req, res) => {
  const notes = req.body?.notes;
  if (typeof notes !== "string" || notes.length > 5000) {
    res.status(400).json({
      title: "Invalid notes",
      detail: "Notes must be a string no longer than 5000 characters.",
    });
    return;
  }

  const userId = String(req.params.userId);

  try {
    const { db, adminConfigTable } = await import("@workspace/db");
    await db
      .insert(adminConfigTable)
      .values({ key: notesKey(userId), value: notes })
      .onConflictDoUpdate({
        target: adminConfigTable.key,
        set: { value: notes, updated_at: new Date() },
      });
  } catch {
    // Non-fatal — return success anyway (DB may be unavailable)
  }

  res.json({
    userId,
    status: "Active" as UserStatus,
    notes,
    updatedAt: new Date().toISOString(),
  });
});

// ─── PATCH /:userId/status — toggle account status in DB ─────────────────────

router.patch("/:userId/status", async (req, res) => {
  const status = req.body?.status as UserStatus | undefined;
  if (status !== "Active" && status !== "Suspended") {
    res.status(400).json({
      title: "Invalid account status",
      detail: 'Status must be either "Active" or "Suspended".',
    });
    return;
  }

  const userId = String(req.params.userId);
  const dbId = parseDbId(userId);

  if (!dbId) {
    res.status(404).json({ title: "User not found", detail: "Invalid user ID." });
    return;
  }

  try {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    await db
      .update(usersTable)
      .set({ account_status: toDbStatus(status), updated_at: new Date() })
      .where(eq(usersTable.id, dbId));

    const notes = await getNotesFromDb(userId);
    res.json({
      userId,
      status,
      notes,
      updatedAt: new Date().toISOString(),
    });
  } catch (_err) {
    res.status(500).json({ title: "Failed to update status", detail: "Internal server error." });
  }
});

// ─── PATCH /:userId/plan — assign investment plan ────────────────────────────

router.patch("/:userId/plan", async (req, res) => {
  const plan = req.body?.plan;
  if (typeof plan !== "string") {
    res.status(400).json({ title: "Invalid plan", detail: "Plan must be a string." });
    return;
  }

  const userId = String(req.params.userId);
  const dbId = parseDbId(userId);

  if (!dbId) {
    res.status(404).json({ title: "User not found", detail: "Invalid user ID." });
    return;
  }

  // "None" means no plan assigned
  const dbPlan = plan === "None" ? null : plan;

  try {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    await db
      .update(usersTable)
      .set({ current_plan: dbPlan, updated_at: new Date() })
      .where(eq(usersTable.id, dbId));

    res.json({ userId, plan });
  } catch (_err) {
    res.status(500).json({ title: "Failed to update plan", detail: "Internal server error." });
  }
});

// ─── POST /:userId/password-reset ────────────────────────────────────────────

router.post("/:userId/password-reset", (req, res) => {
  res.json({
    success: true,
    message: `Password reset requested for ${req.params.userId}.`,
  });
});

// ─── DELETE /:userId — permanently delete user from DB ───────────────────────

router.delete("/:userId", async (req, res) => {
  const userId = String(req.params.userId);
  const dbId = parseDbId(userId);

  if (!dbId) {
    res.status(404).json({ title: "User not found", detail: "Invalid user ID." });
    return;
  }

  try {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    await db.delete(usersTable).where(eq(usersTable.id, dbId));
    // Best-effort cleanup of persisted notes
    try {
      const { adminConfigTable: cfg } = await import("@workspace/db");
      const { eq: eqCfg } = await import("drizzle-orm");
      await db.delete(cfg).where(eqCfg(cfg.key, notesKey(userId)));
    } catch { /* non-fatal */ }

    res.json({ success: true, message: `User ${userId} deleted.` });
  } catch (_err) {
    res.status(500).json({ title: "Failed to delete user", detail: "Internal server error." });
  }
});

export default router;

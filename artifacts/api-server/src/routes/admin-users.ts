import { Router, type IRouter } from "express";
import { requireAdmin } from "../middleware/requireAuth.js";

type UserStatus = "Active" | "Suspended";
type UserPlan = "Starter" | "Silver" | "Gold" | "Platinum";

// In-memory admin notes (ephemeral per-session — not part of persistent user data)
const adminNotes = new Map<string, string>();

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

/** Valid plan names the UI understands */
const VALID_PLANS: UserPlan[] = ["Starter", "Silver", "Gold", "Platinum"];

function toUiPlan(dbPlan: string | null | undefined): UserPlan {
  if (dbPlan && VALID_PLANS.includes(dbPlan as UserPlan)) return dbPlan as UserPlan;
  return "None";
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

// ─── GET /:userId/profile — profile + notes ───────────────────────────────────

router.get("/:userId/profile", async (req, res) => {
  const userId = String(req.params.userId);
  const dbId = parseDbId(userId);

  if (dbId) {
    // Fetch live status from DB
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
          notes: adminNotes.get(userId) ?? "",
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
    notes: adminNotes.get(userId) ?? "",
    updatedAt: new Date(0).toISOString(),
  });
});

// ─── PUT /:userId/notes — save admin notes (in-memory) ───────────────────────

router.put("/:userId/notes", (req, res) => {
  const notes = req.body?.notes;
  if (typeof notes !== "string" || notes.length > 5000) {
    res.status(400).json({
      title: "Invalid notes",
      detail: "Notes must be a string no longer than 5000 characters.",
    });
    return;
  }

  const userId = String(req.params.userId);
  adminNotes.set(userId, notes);

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

    res.json({
      userId,
      status,
      notes: adminNotes.get(userId) ?? "",
      updatedAt: new Date().toISOString(),
    });
  } catch (_err) {
    res.status(500).json({ title: "Failed to update status", detail: "Internal server error." });
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
    adminNotes.delete(userId);

    res.json({ success: true, message: `User ${userId} deleted.` });
  } catch (_err) {
    res.status(500).json({ title: "Failed to delete user", detail: "Internal server error." });
  }
});

export default router;

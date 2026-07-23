import { Router, type IRouter } from "express";

type UserStatus = "Active" | "Suspended";

interface UserProfileRecord {
  userId: string;
  status: UserStatus;
  notes: string;
  updatedAt: string;
}

const profiles = new Map<string, UserProfileRecord>([
  [
    "#U-4817",
    {
      userId: "#U-4817",
      status: "Suspended",
      notes: "",
      updatedAt: new Date(0).toISOString(),
    },
  ],
]);

function getOrCreateProfile(userId: string) {
  const existing = profiles.get(userId);
  if (existing) return existing;

  const profile: UserProfileRecord = {
    userId,
    status: "Active",
    notes: "",
    updatedAt: new Date(0).toISOString(),
  };
  profiles.set(userId, profile);
  return profile;
}

function updated(profile: UserProfileRecord) {
  profile.updatedAt = new Date().toISOString();
  return profile;
}

const router: IRouter = Router();

router.get("/:userId/profile", (req, res) => {
  res.json(getOrCreateProfile(String(req.params.userId)));
});

router.put("/:userId/notes", (req, res) => {
  const notes = req.body?.notes;
  if (typeof notes !== "string" || notes.length > 5000) {
    res.status(400).json({
      title: "Invalid notes",
      detail: "Notes must be a string no longer than 5000 characters.",
    });
    return;
  }

  const profile = getOrCreateProfile(String(req.params.userId));
  profile.notes = notes;
  res.json(updated(profile));
});

router.patch("/:userId/status", (req, res) => {
  const status = req.body?.status;
  if (status !== "Active" && status !== "Suspended") {
    res.status(400).json({
      title: "Invalid account status",
      detail: 'Status must be either "Active" or "Suspended".',
    });
    return;
  }

  const profile = getOrCreateProfile(String(req.params.userId));
  profile.status = status;
  res.json(updated(profile));
});

router.post("/:userId/password-reset", (req, res) => {
  const profile = getOrCreateProfile(String(req.params.userId));
  res.json({
    success: true,
    message: `Password reset requested for ${profile.userId}.`,
  });
});

router.delete("/:userId", (req, res) => {
  const userId = String(req.params.userId);
  profiles.delete(userId);
  res.json({
    success: true,
    message: `User ${userId} deleted.`,
  });
});

export default router;
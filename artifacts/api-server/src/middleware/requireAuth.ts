import type { Request, Response, NextFunction } from "express";

/** Rejects requests that have no active session. */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId) {
    res
      .status(401)
      .json({ error: "UNAUTHENTICATED", message: "Please log in to continue." });
    return;
  }
  next();
}

/** Rejects requests that are not from an admin session. */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId) {
    res
      .status(401)
      .json({ error: "UNAUTHENTICATED", message: "Please log in to continue." });
    return;
  }
  if (req.session.userRole !== "admin") {
    res.status(403).json({ error: "UNAUTHORIZED", message: "Unauthorized Access" });
    return;
  }
  next();
}

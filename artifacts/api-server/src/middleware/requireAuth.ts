import type { Request, Response, NextFunction } from "express";

/** Returns true when the request belongs to an authenticated admin session. */
function isAdminSession(req: Request): boolean {
  return (
    req.session.isAdmin === true ||
    (!!req.session.userId && req.session.userRole === "admin")
  );
}

/** Rejects requests that have no active session (user or admin). */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId && !req.session.isAdmin) {
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
  if (!isAdminSession(req)) {
    if (!req.session.userId && !req.session.isAdmin) {
      res
        .status(401)
        .json({ error: "UNAUTHENTICATED", message: "Please log in to continue." });
      return;
    }
    res.status(403).json({ error: "UNAUTHORIZED", message: "Unauthorized Access" });
    return;
  }
  next();
}

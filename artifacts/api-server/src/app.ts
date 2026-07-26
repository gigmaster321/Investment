import path from "node:path";
import { existsSync } from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import adminAuthRouter from "./routes/admin-auth.js";
import adminUsersRouter from "./routes/admin-users.js";
import plansRouter from "./routes/plans.js";
import investmentsRouter from "./routes/investments.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Allow credentials (cookies) from the frontend origin
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Persistent session store — survives server restarts.
// connect-pg-simple creates the "session" table automatically on first use.
const PgSession = connectPgSimple(session);

const sessionStore = process.env.DATABASE_URL
  ? new PgSession({
      conString: process.env.DATABASE_URL,
      // The session table is created at startup in index.ts with correct
      // PG12+-compatible SQL. Do NOT use createTableIfMissing here — the
      // bundled table.sql uses WITH (OIDS=FALSE) which is invalid on PG12+
      // and permanently poisons the internal promise, breaking all session saves.
      // Prune expired sessions once per hour.
      pruneSessionInterval: 60 * 60,
    })
  : undefined; // falls back to MemoryStore when DATABASE_URL is not set

app.use(
  session({
    name: "qinvest.sid",
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "change-me-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

app.use("/api", router);
app.use("/api/auth", adminAuthRouter);
// WordPress-compatible REST namespace for external admin clients.
app.use("/wp-json/quantum/v1/admin/users", adminUsersRouter);
app.use("/wp-json/quantum/v1/plans", plansRouter);
app.use("/wp-json/quantum/v1/investments", investmentsRouter);

// The production deployment sends the public domain to this Express process.
// Serve the Vite build after the API mounts so API responses and API 404s are
// never replaced with the SPA document. FRONTEND_DIST_DIR is configurable for
// Docker/PM2 deployments; the repository-root dist/ is the default.
const frontendDistCandidates = [
  process.env.FRONTEND_DIST_DIR,
  path.resolve(process.cwd(), "dist"),
  path.resolve(process.cwd(), "../../dist"),
].filter((candidate): candidate is string => Boolean(candidate));
const frontendDist = frontendDistCandidates.find((candidate) =>
  existsSync(path.join(candidate, "index.html")),
);

if (frontendDist) {
  app.use(express.static(frontendDist, { index: false }));

  // Vite builds a client-side SPA, so direct visits to routes such as
  // /login and /dashboard must receive index.html for the client router.
  app.get(
    /^(?!\/(?:api|wp-json)(?:\/|$)).*/,
    (_req, res) => res.sendFile(path.join(frontendDist, "index.html")),
  );
}

export default app;

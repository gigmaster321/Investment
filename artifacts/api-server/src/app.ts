import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
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
      // Table was created via schema migration; no need for runtime auto-create.
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
// WordPress-compatible REST namespace for external admin clients.
app.use("/wp-json/quantum/v1/admin/users", adminUsersRouter);
app.use("/wp-json/quantum/v1/plans", plansRouter);
app.use("/wp-json/quantum/v1/investments", investmentsRouter);

export default app;

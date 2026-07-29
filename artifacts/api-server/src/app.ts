import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const PgStore = connectPgSimple(session);

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

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup - lazy: only attach DB store if DATABASE_URL is present
const sessionSecret = process.env["SESSION_SECRET"] ?? "dev-secret-change-in-production";
const isDev = process.env["NODE_ENV"] !== "production";

app.use(
  session({
    name: "qinvest.sid", // must match the cookie name cleared in the logout route
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    // Extend the session TTL on every request so active users are never
    // logged out mid-session. The cookie / store record expiry slides
    // forward by `maxAge` on each authenticated request.
    rolling: true,
    store: process.env["DATABASE_URL"]
      ? new PgStore({
          conString: process.env["DATABASE_URL"],
          tableName: "session",
          createTableIfMissing: false,
        })
      : undefined,
    cookie: {
      secure: !isDev,
      httpOnly: true,
      sameSite: isDev ? "lax" : "none",
      // 7-day persistent cookie — survives browser close/reopen.
      // The login route may extend this to 30 days when rememberMe=true.
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

// Production: serve the built React frontend and provide SPA fallback.
// This block is intentionally skipped in development — Vite's dev server
// handles the frontend on its own port in that environment.
if (process.env["NODE_ENV"] === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Compiled output lives at  artifacts/api-server/dist/app.mjs
  // Frontend dist lives at    artifacts/quantum-investments/dist/public
  const frontendDir = path.resolve(__dirname, "../../quantum-investments/dist/public");

  app.use(
    express.static(frontendDir, {
      etag: true,
      // Vite appends a content hash to every JS/CSS filename on build.
      // 1-year max-age is safe because any file change produces a new URL.
      maxAge: "1y",
    }),
  );

  // SPA fallback: every non-API GET returns index.html so client-side routing works.
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(frontendDir, "index.html"));
  });
}

export default app;

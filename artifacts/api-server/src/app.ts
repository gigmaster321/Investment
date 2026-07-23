import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
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

// Session middleware — uses MemoryStore in development.
// Replace with connect-pg-simple when the database is provisioned for production persistence.
app.use(
  session({
    name: "qinvest.sid",
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

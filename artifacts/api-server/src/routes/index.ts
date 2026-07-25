import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import adminUsersRouter from "./admin-users.js";
import plansRouter from "./plans.js";
import investmentsRouter from "./investments.js";
import depositsRouter from "./deposits.js";
import transactionsRouter from "./transactions.js";
import withdrawalsRouter from "./withdrawals.js";
import authRouter from "./auth.js";
import earningsRouter from "./earnings.js";

const router: IRouter = Router();

router.use("/auth", authRouter);
router.use(healthRouter);
router.use("/admin/users", adminUsersRouter);
router.use("/plans", plansRouter);
router.use("/investments", investmentsRouter);
router.use("/deposits", depositsRouter);
router.use("/transactions", transactionsRouter);
router.use("/withdrawals", withdrawalsRouter);
router.use("/earnings", earningsRouter);
// Keep the same JSON contract available to WordPress-style REST clients.
router.use("/wp-json/quantum/v1/admin/users", adminUsersRouter);

export default router;

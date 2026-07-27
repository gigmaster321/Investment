import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import adminAuthRouter from "./admin-auth";
import plansRouter from "./plans";
import investmentsRouter from "./investments";
import depositsRouter from "./deposits";
import withdrawalsRouter from "./withdrawals";
import earningsRouter from "./earnings";
import transactionsRouter from "./transactions";
import notificationsRouter from "./notifications";
import walletsRouter from "./wallets";
import adminUsersRouter from "./admin-users";
import adminWalletsRouter from "./admin-wallets";
import adminManualProfitRouter from "./admin-manual-profit";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/auth", adminAuthRouter);
router.use("/plans", plansRouter);
router.use("/investments", investmentsRouter);
router.use("/deposits", depositsRouter);
router.use("/withdrawals", withdrawalsRouter);
router.use("/earnings", earningsRouter);
router.use("/transactions", transactionsRouter);
router.use("/notifications", notificationsRouter);
router.use("/wallets", walletsRouter);
router.use("/admin/users", adminUsersRouter);
router.use("/admin/wallets", adminWalletsRouter);
router.use("/admin/manual-profit", adminManualProfitRouter);
router.use("/chat", chatRouter);

export default router;

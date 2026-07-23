import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminUsersRouter from "./admin-users";
import plansRouter from "./plans";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin/users", adminUsersRouter);
router.use("/plans", plansRouter);
// Keep the same JSON contract available to WordPress-style REST clients.
router.use("/wp-json/quantum/v1/admin/users", adminUsersRouter);

export default router;

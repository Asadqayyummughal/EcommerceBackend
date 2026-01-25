import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getDashboardStats } from "../controollers/dashboard.controller";
import { requirePermission } from "../../middlewares/requirePermisson.middleware";
const router = Router();
router.get(
  "/",
  authMiddleware,
  //   roleMiddleware("admin"),
  //requirePermission('')
  getDashboardStats,
);

export default router;

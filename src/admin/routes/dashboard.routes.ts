import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getDashboardStats } from "../controollers/dashboard.controller";
const router = Router();
router.get(
  "/dashboard",
  authMiddleware,
  //   roleMiddleware("admin"),
  getDashboardStats
);

export default router;

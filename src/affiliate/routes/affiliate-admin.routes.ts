import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as adminCtrl from "../controllers/affiliate-admin.controller";

const router = Router();

// All admin affiliate routes require auth (admin role enforced at permission level)
router.use(authMiddleware);

// Affiliate management
router.get("/", adminCtrl.listAffiliates);
router.get("/analytics", adminCtrl.getAnalytics);
router.put("/:id/status", adminCtrl.updateStatus);
router.get("/:id/conversions", adminCtrl.getConversions);

// Payout management
router.get("/payouts", adminCtrl.listPayouts);
router.put("/payouts/:id/approve", adminCtrl.approvePayout);
router.put("/payouts/:id/paid", adminCtrl.markPayoutPaid);
router.put("/payouts/:id/reject", adminCtrl.rejectPayout);

export default router;

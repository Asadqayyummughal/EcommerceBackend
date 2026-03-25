import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as affiliateCtrl from "../controllers/affiliate.controller";

const router = Router();

// Public — click tracking (no auth needed, anyone can click a link)
router.get("/track/:code", affiliateCtrl.trackClick);

// Public — program info
router.get("/program", affiliateCtrl.getProgram);

// Authenticated affiliate routes
router.post("/apply", authMiddleware, affiliateCtrl.apply);
router.get("/me", authMiddleware, affiliateCtrl.getMe);
router.get("/stats", authMiddleware, affiliateCtrl.getStats);
router.get("/conversions", authMiddleware, affiliateCtrl.getConversions);
router.get("/payouts", authMiddleware, affiliateCtrl.getPayouts);
router.post("/payouts/request", authMiddleware, affiliateCtrl.requestPayout);

export default router;

import { Router } from "express";
const router = Router();
import * as vendorController from "../controllers/vendor.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
router.post("/", authMiddleware, vendorController.applyVendor);
router.get(
  "/getVendorsByStatus",
  authMiddleware,
  vendorController.getVendorsByStatus,
); //admin only

// router.put("/:id/approve",vendorController); // approveVenodor

export default router;

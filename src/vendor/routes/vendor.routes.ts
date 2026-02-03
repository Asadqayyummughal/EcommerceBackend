import { Router } from "express";
const router = Router();
import * as vendorController from "../controller/vendor.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { isAdmin } from "../../middlewares/admin.middleware";

router.post("/", authMiddleware, vendorController.applyVendor);
router.get(
  "/getVendorsByStatus",
  authMiddleware,
  isAdmin,
  vendorController.getVendorsByStatus,
);
router.put(
  "/:vendorId/approve",
  authMiddleware,
  isAdmin,
  vendorController.approveVendor,
); // approveVenodor
export default router;

// Remaining
//GET /store/:slug
//GET /vendor/analytics/overview
//GET /vendor/analytics/sales?range=7d|30d|12m
//GET /vendor/analytics/top-products
//GET /vendor/analytics/order-status
//POST /vendor/payouts/request
//POST /vendor/payouts/request

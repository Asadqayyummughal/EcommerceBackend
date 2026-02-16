import { Router } from "express";
const router = Router();
import * as vendorController from "../controller/vendor.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { isAdmin } from "../../middlewares/admin.middleware";
import { requireActiveVendor } from "../../middlewares/vendor.middleware";

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
router.post(
  "/payouts/request",
  authMiddleware,
  requireActiveVendor,
  vendorController.requestPayout,
);

router.get(
  "/payouts/",
  authMiddleware,
  isAdmin,
  vendorController.listAllPayouts,
);
router.put(
  "/payouts/:id/approve",
  authMiddleware,
  isAdmin,
  vendorController.approvedPayout,
);
router.post(
  "/payouts/withdraw",
  authMiddleware,
  requireActiveVendor,
  vendorController.requestPayout,
);
router.post(
  "/stripe/onboard",
  authMiddleware,
  requireActiveVendor,
  vendorController.onboardStripe,
);
router.get(
  "/:vendorId/store",
  authMiddleware,
  //   roleMiddleware
  vendorController.listVendorProducts,
);

// /vendor/payouts/request
export default router;

// Remaining
//GET /store/:slug
//GET /vendor/analytics/overview
//GET /vendor/analytics/sales?range=7d|30d|12m
//GET /vendor/analytics/top-products
//GET /vendor/analytics/order-status

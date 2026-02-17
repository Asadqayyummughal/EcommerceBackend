import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as storeController from "../controller/store.controller";
import { requireActiveVendor } from "../../middlewares/vendor.middleware";
import { isAdmin } from "../../middlewares/admin.middleware";
const router = Router();
// POST /api/vendor/store
router.post(
  "/",
  authMiddleware,
  requireActiveVendor,
  //required permission necessary
  //  requireVendorApproved("vendor"),
  storeController.createStore,
);
router.patch(
  "/:id/approve",
  authMiddleware,
  isAdmin,
  storeController.approveStore,
);

router.put(
  "/:id",
  authMiddleware,
  requireActiveVendor,
  storeController.updateStore,
);

router.get("/", authMiddleware, storeController.getStoreByUserId);
router.get(
  "/listAllStores",
  authMiddleware,
  isAdmin,
  storeController.listStores,
);
router.get(
  "/:id/analytics",
  authMiddleware,
  requireActiveVendor,
  storeController.getStoreAnalytics,
);
router.get(
  "/:id/products",
  authMiddleware,
  requireActiveVendor,
  storeController.listStoreProducts,
);
router.get(
  "/:vendorId/orders",
  authMiddleware,
  requireActiveVendor,
  storeController.listStoreOrders,
);

export default router;

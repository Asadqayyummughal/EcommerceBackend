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

router.get("/", authMiddleware, isAdmin, storeController.listStores);

router.put(
  "/:id",
  authMiddleware,
  requireActiveVendor,
  storeController.updateStore,
);

export default router;

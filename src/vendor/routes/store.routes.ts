import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as storeController from "../controller/store.controller";
const router = Router();
// POST /api/vendor/store
router.post(
  "/",
  authMiddleware,
  //required permission necessary
  //  requireVendorApproved("vendor"),
  storeController.createStore,
);
router.patch(
  "/:id/approve",
  authMiddleware,
  //required permission necessary
  //requireVendorApproved("vendor"),
  storeController.approveStore,
);
// auth
// requireRole("vendor")
// requireVendorApproved
// PATCH /api/admin/stores/:id/approve

export default router;

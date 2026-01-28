import { Router } from "express";
const router = Router();
import * as vendorController from "../controller/vendor.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
router.post("/", authMiddleware, vendorController.applyVendor);
router.get(
  "/getVendorsByStatus",
  authMiddleware,
  vendorController.getVendorsByStatus,
); //admin only
router.put(
  "/:vendorId/approve",
  authMiddleware,
  vendorController.approveVendor,
); // approveVenodor

router.post("/product/");
export default router;

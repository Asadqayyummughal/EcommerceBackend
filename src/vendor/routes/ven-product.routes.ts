import { Router } from "express";
import { requirePermission } from "../../middlewares/requirePermisson.middleware";
import * as vendorProductController from "../controller/ven-product.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { uploadMiddleware } from "../../middlewares/multer";
const router = Router();
router.post(
  "",
  authMiddleware,
  requirePermission("product:create"),
  uploadMiddleware.array("images", 6),
  vendorProductController.createVendorProduct,
); //requireVendorApproved
// router.get("");
// router.put("/:id");
export default router;

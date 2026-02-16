import { Router } from "express";
import * as productControllers from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { uploadMiddleware } from "../middlewares/multer";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";
import { validate } from "../middlewares/validate.middleware";
const router = Router();

router.post(
  "/",
  authMiddleware,
  //   roleMiddleware,
  uploadMiddleware.array("images", 6),
  validate(createProductSchema),
  productControllers.createProduct,
);
router.get("/", authMiddleware, productControllers.listProducts);

router.patch(
  "/:id",
  authMiddleware,
  //   roleMiddleware,
  uploadMiddleware.array("images", 6),
  validate(updateProductSchema),
  productControllers.updateProduct,
);

router.delete(
  "/:id",
  authMiddleware,
  //roleMiddleware
  productControllers.deleteProduct,
);
router.get(
  "/:id",
  authMiddleware,
  //   roleMiddleware
  productControllers.getProduct,
);

export default router;

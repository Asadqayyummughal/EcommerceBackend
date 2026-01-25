import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { addToCartSchema, syncCartSchema } from "../validators/cart.validator";
import { PERMISSIONS } from "../config/permission.config";
import { requirePermission } from "../middlewares/requirePermisson.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requirePermission(PERMISSIONS.CART_READ),
  cartController.getCart,
);
router.post(
  "/add",
  validate(addToCartSchema),
  authMiddleware,
  requirePermission(PERMISSIONS.CART_CREATE),
  cartController.addToCart,
);
router.put(
  "/update",
  authMiddleware,
  requirePermission(PERMISSIONS.CART_UPDATE),
  cartController.updateCartItem,
);
router.delete(
  "/remove",
  authMiddleware,
  requirePermission(PERMISSIONS.CART_DELET),
  cartController.removeCartItem,
);
router.post(
  "/sync",
  authMiddleware,
  validate(syncCartSchema),
  cartController.syncCart,
);

export default router;

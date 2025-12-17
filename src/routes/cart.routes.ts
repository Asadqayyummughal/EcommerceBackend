import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { syncCartSchema } from "../validators/cart.validator";

const router = Router();

router.get("/", authMiddleware, cartController.getCart);
router.post("/add", authMiddleware, cartController.addToCart);
router.put("/update", authMiddleware, cartController.updateCartItem);
router.delete("/remove", authMiddleware, cartController.removeCartItem);
router.post(
  "/sync",
  authMiddleware,
  validate(syncCartSchema),
  cartController.syncCart
);

export default router;

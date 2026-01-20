import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

router.post("/", authMiddleware, wishlistController.toggleWishlistController);

router.get("/", authMiddleware, wishlistController.getWishlistController);
router.delete(
  "/:productId",
  authMiddleware,
  wishlistController.deleteWishlistController
);
export default router;

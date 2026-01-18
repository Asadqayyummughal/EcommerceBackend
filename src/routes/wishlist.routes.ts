import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
const router = Router();

router.post("/", wishlistController.toggleWishlistController);
export default router;

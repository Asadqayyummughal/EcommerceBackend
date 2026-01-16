import Router from "express";
import * as reviewController from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();

router.post("/", authMiddleware, reviewController.createReview);
router.get("/", authMiddleware, reviewController.getAllReviews); //amin only api
router.get("/product/:id", authMiddleware, reviewController.getProductReviews);
router.put("/:id", authMiddleware, reviewController.updateReview);
router.delete("/:id", authMiddleware, reviewController.deleteReview); //amdin middleware required
export default router;

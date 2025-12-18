import { Router } from "express";
import { checkout } from "../controllers/checkout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, checkout);

export default router;

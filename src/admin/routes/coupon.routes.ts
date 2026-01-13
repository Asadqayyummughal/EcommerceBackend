import { Router } from "express";
import * as couponController from "../controollers/coupon.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
// import { isAdmin } from "../middlewares/auth";

const router = Router();

router.post("/", authMiddleware, couponController.createCoupon); //isAdmin
router.get("/", authMiddleware, couponController.getAllCoupons); //isAdmin
router.get("/:id", authMiddleware, couponController.getCouponById); //isAdmin
router.put("/:id", authMiddleware, couponController.updateCoupon); //isAdmin
router.delete("/:id", authMiddleware, couponController.deleteCoupon); //isAdmin

export default router;

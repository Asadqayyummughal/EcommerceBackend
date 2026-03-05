import { Request, Response } from "express";
import * as couponService from "../services/coupon.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json({ success: true, message: "Coupon created", data: coupon });
});

export const getAllCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await couponService.getAllCoupons();
  res.json({ success: true, data: coupons });
});

export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.getCouponById(req.params.id);
  res.json({ success: true, data: coupon });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  res.json({ success: true, message: "Coupon updated", data: coupon });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await couponService.deleteCoupon(req.params.id);
  res.json({ success: true, message: "Coupon deleted" });
});

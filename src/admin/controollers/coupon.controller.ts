import { Request, Response } from "express";
import * as couponService from "../services/coupon.service";

export const createCoupon = async (req: Request, res: Response) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json(coupon);
};

export const getAllCoupons = async (_req: Request, res: Response) => {
  const coupons = await couponService.getAllCoupons();
  res.json(coupons);
};

export const getCouponById = async (req: Request, res: Response) => {
  const coupon = await couponService.getCouponById(req.params.id);
  res.json(coupon);
};

export const updateCoupon = async (req: Request, res: Response) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  res.json(coupon);
};

export const deleteCoupon = async (req: Request, res: Response) => {
  await couponService.deleteCoupon(req.params.id);
  res.json({ message: "Coupon deleted successfully" });
};

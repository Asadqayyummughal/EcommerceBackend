import { Coupon } from "../../models/coupon.model";
import { AppError } from "../../utils/AppError";

export const createCoupon = async (data: any) => {
  const existing = await Coupon.findOne({ code: data.code });
  if (existing) throw new AppError("Coupon code already exists", 409);
  if (data.type === "percentage" && data.value > 100) {
    throw new AppError("Percentage discount cannot exceed 100%", 400);
  }
  if (!data.applicableProducts?.length && !data.applicableCategories?.length) {
    throw new AppError("Coupon must apply to products or categories", 400);
  }

  return Coupon.create(data);
};

export const getAllCoupons = async () => {
  return Coupon.find().sort({ createdAt: -1 });
};

export const getCouponById = async (id: string) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError("Coupon not found", 404);
  return coupon;
};

export const updateCoupon = async (id: string, data: any) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError("Coupon not found", 404);

  if (coupon.usedCount > 0 && data.value) {
    throw new AppError("Cannot change value of a used coupon", 400);
  }

  Object.assign(coupon, data);
  await coupon.save();
  return coupon;
};

export const deleteCoupon = async (id: string) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError("Coupon not found", 404);

  if (coupon.usedCount > 0) {
    throw new AppError("Cannot delete a used coupon", 400);
  }

  await coupon.deleteOne();
};

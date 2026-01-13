import { Coupon } from "../../models/coupon.model";

export const createCoupon = async (data: any) => {
  const existing = await Coupon.findOne({ code: data.code });
  if (existing) throw new Error("Coupon code already exists");
  // 🔐 Validation rules
  if (data.type === "percentage" && data.value > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }
  if (!data.applicableProducts?.length && !data.applicableCategories?.length) {
    throw new Error("Coupon must apply to products or categories");
  }

  return Coupon.create(data);
};

export const getAllCoupons = async () => {
  return Coupon.find().sort({ createdAt: -1 });
};

export const getCouponById = async (id: string) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new Error("Coupon not found");
  return coupon;
};

export const updateCoupon = async (id: string, data: any) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new Error("Coupon not found");

  // 🚫 Prevent editing heavily-used coupons
  if (coupon.usedCount > 0 && data.value) {
    throw new Error("Cannot change value of a used coupon");
  }

  Object.assign(coupon, data);
  await coupon.save();
  return coupon;
};

export const deleteCoupon = async (id: string) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new Error("Coupon not found");

  if (coupon.usedCount > 0) {
    throw new Error("Cannot delete a used coupon");
  }

  await coupon.deleteOne();
};

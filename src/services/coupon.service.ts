import { ICart } from "../models/cart.model";
import { Coupon } from "../models/coupon.model";
import { CouponUsage } from "../models/couponUsage.model";
import { AppError } from "../utils/AppError";

export const validateCoupon = async (
  code: string,
  cart: ICart,
  userId: string,
) => {
  const coupon = await Coupon.findOne({
    code,
    isActive: true,
    validFrom: { $lte: new Date() },
    validTill: { $gte: new Date() },
  });
  if (!coupon) throw new AppError("Invalid or expired coupon", 400);
  // Global usage
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    throw new AppError("Coupon usage limit reached", 400);

  // Per user usage
  const userUsage = await CouponUsage.countDocuments({
    coupon: coupon._id,
    user: userId,
  });
  if (coupon.perUserLimit && userUsage >= coupon.perUserLimit)
    throw new AppError("You have already used this coupon", 400);

  return coupon;
};

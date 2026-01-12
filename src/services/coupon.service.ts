export const validateCoupon = async (code: string, cart, userId: string) => {
  const coupon = await Coupon.findOne({
    code,
    isActive: true,
    validFrom: { $lte: new Date() },
    validTill: { $gte: new Date() },
  });

  if (!coupon) throw new Error("Invalid coupon");

  // Global usage
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    throw new Error("Coupon limit exceeded");

  // Per user usage
  const userUsage = await CouponUsage.countDocuments({
    coupon: coupon._id,
    user: userId,
  });

  if (coupon.perUserLimit && userUsage >= coupon.perUserLimit)
    throw new Error("Coupon already used");

  return coupon;
};

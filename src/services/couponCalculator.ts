import { ICartItem } from "../models/cart.model";
import { ICoupon } from "../models/coupon.model";

export const calculateDiscount = (coupon: ICoupon, eligibleItems: any[]) => {
  debugger;
  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  let discount = 0;

  if (coupon.type === "percentage") {
    discount = (eligibleSubtotal * coupon.value) / 100;
  }

  if (coupon.type === "flat") {
    discount = Math.min(coupon.value, eligibleSubtotal);
  }

  return {
    discount,
    eligibleSubtotal,
  };
};

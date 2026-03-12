import { ICartItem } from "../models/cart.model";
import { IOrderItem } from "../models/order.model";
import { ICoupon } from "../models/coupon.model";

export const getEligibleItems = (cartItems: IOrderItem[], coupon: ICoupon) => {
  // Global coupon — applies to everything
  if (
    !coupon.applicableProducts?.length &&
    !coupon.applicableCategories?.length
  ) {
    return cartItems;
  }

  return cartItems.filter((item) => {
    if (
      coupon.applicableProducts?.some(
        (p) => p.toString() === item.product.toString()
      )
    )
      return true;

    if (
      coupon.applicableCategories?.some(
        (c) => c.toString() === item.category?.toString()
      )
    )
      return true;

    return false;
  });
};

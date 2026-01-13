import { ICart, ICartItem } from "../models/cart.model";
import { ICoupon } from "../models/coupon.model";

export const getEligibleItems = (cartItems: ICartItem[], coupon: ICoupon) => {
  // Global coupon
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

    // if (
    //   coupon.applicableCategories?.some(
    //     (c) => c.toString() === item.product.category?.toString()
    //   )
    // )
    //   return true;

    return false;
  });
};

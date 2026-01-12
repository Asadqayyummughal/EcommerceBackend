export const getEligibleItems = (cartItems, coupon) => {
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

    if (
      coupon.applicableCategories?.some(
        (c) => c.toString() === item.category?.toString()
      )
    )
      return true;

    return false;
  });
};

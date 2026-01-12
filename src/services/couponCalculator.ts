export const calculateDiscount = (coupon, eligibleItems) => {
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

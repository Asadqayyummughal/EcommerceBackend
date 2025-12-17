export const calculateCartTotals = (items: any[]) => {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of items) {
    totalItems += item.quantity;
    totalPrice += item.quantity * item.price;
  }

  return { totalItems, totalPrice };
};

export const ROUTE_PERMISSIONS = {
  // Orders
  "GET /orders": "order.read",
  "GET /orders/:id": "order.read",
  "PUT /orders/:id/cancel": "order.cancel",
  "PUT /orders/:id/status": "order.update_status",

  // Cart
  "GET /cart": "cart.read",
  "POST /cart": "cart.update",

  // Coupons
  "POST /coupons/apply": "coupon.apply",

  // Products (Admin)
  "POST /products": "product.create",
  "PUT /products/:id": "product.update",
  "DELETE /products/:id": "product.delete",
};

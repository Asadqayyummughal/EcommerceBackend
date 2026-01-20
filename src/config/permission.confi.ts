export const PERMISSIONS = [
  // Cart
  { key: "cart.read", module: "cart" },
  { key: "cart.update", module: "cart" },
  { key: "cart.clear", module: "cart" },

  // Orders
  { key: "order.read", module: "orders" },
  { key: "order.cancel", module: "orders" },
  { key: "order.status.update", module: "orders" },
  { key: "order.refund", module: "orders" },

  // Products
  { key: "product.create", module: "products" },
  { key: "product.update", module: "products" },
  { key: "product.delete", module: "products" },
  { key: "inventory.adjust", module: "products" },

  // Coupons
  { key: "coupon.create", module: "coupons" },
  { key: "coupon.update", module: "coupons" },
  { key: "coupon.delete", module: "coupons" },
  { key: "coupon.read", module: "coupons" },

  // Users & Roles
  { key: "user.read", module: "users" },
  { key: "user.update", module: "users" },
  { key: "role.manage", module: "roles" },
  { key: "permission.manage", module: "permissions" },
];

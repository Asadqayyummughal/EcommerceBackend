export const PERMISSION_MATRIX = {
  // 👤 USER
  user: [
    "cart.read",
    "cart.update",
    "order.read",
    "order.create",
    "order.cancel",
    "wishlist.manage",
    "coupon.apply",
  ],

  // 🧑‍💼 ADMIN
  admin: [
    "*", // full access
  ],

  // 🧑‍🏭 STAFF / MANAGER
  staff: [
    "order.read",
    "order.update_status",
    "shipment.create",
    "shipment.update",
    "product.read",
    "product.update",
  ],
  vendor: [
    "product:create",
    "product:update",
    "product:delete",
    "product:read",
    "product:read:own",
    "product:update:own",
    "product:delete:own",
  ],
} as const;

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
    "ADMIN_VENDOR_READ",
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
} as const;

// ADMIN_VENDOR_READ
// ADMIN_VENDOR_APPROVE
// ADMIN_VENDOR_REJECT
// ADMIN_VENDOR_SUSPEND
// VENDOR_PRODUCT_CREATE
// VENDOR_PRODUCT_UPDATE
// VENDOR_ORDER_READ
// VENDOR_ORDER_UPDATE_STATUS
// USER_VENDOR_APPLY
// ADMIN_VENDOR_APPROVE
// ADMIN_VENDOR_READ

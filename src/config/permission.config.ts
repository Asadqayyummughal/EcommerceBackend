export const PERMISSIONS = {
  // Auth / Users
  USER_READ: "user.read",
  USER_MANAGE: "user.manage",

  // Roles & Permissions
  ROLE_READ: "role.read",
  ROLE_MANAGE: "role.manage",
  PERMISSION_READ: "permission.read",
  PERMISSION_MANAGE: "permission.manage",

  // Products
  PRODUCT_READ: "product.read",
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",

  // Cart
  CART_CREATE: "cart.create",
  CART_READ: "cart.read",
  CART_UPDATE: "cart.update",
  CART_DELET: "cart.delete",

  // Orders
  ORDER_READ: "order.read",
  ORDER_CREATE: "order.create",
  ORDER_CANCEL: "order.cancel",
  ORDER_UPDATE_STATUS: "order.update_status",

  // Payments
  PAYMENT_INITIATE: "payment.initiate",
  PAYMENT_REFUND: "payment.refund",

  // Coupons
  COUPON_APPLY: "coupon.apply",
  COUPON_MANAGE: "coupon.manage",

  // Inventory
  INVENTORY_ADJUST: "inventory.adjust",

  // Wishlist
  WISHLIST_MANAGE: "wishlist.manage",

  // Returns
  RETURN_CREATE: "return.create",
  RETURN_APPROVE: "return.approve",
  RETURN_REFUND: "return.refund",

  // Notifications
  NOTIFICATION_SEND: "notification.send",
} as const;

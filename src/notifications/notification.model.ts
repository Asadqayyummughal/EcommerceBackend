// notification.model.ts
import { Schema, model } from "mongoose";

export enum NotificationType {
  ORDER_PLACED = "order_placed",
  ORDER_SHIPPED = "order_shipped",
  ORDER_DELIVERED = "order_delivered",
  ORDER_CANCELLED = "order_cancelled",
  PAYMENT_FAILED = "payment_failed",
  VENDOR_APPROVED = "vendor_approved",
  NEW_REVIEW = "new_review",
  LOW_STOCK = "low_stock",
  SYSTEM_ANNOUNCEMENT = "system_announcement",
}

export enum NotificationChannel {
  IN_APP = "in_app",
  PUSH = "push",
  EMAIL = "email",
  SMS = "sms",
}

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed }, // { orderId, productId, vendorId, ... }
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      default: NotificationChannel.IN_APP,
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 }); // for pagination
notificationSchema.index({ user: 1, read: 1 });

export const Notification = model("Notification", notificationSchema);

//from here

// import mongoose, { Schema, Document } from "mongoose";

// export type NotificationType =
//   | "order"
//   | "payout"
//   | "wallet"
//   | "coupon"
//   | "return"
//   | "system"
//   | "promotion";

// export type NotificationChannel =
//   | "in_app"
//   | "email"
//   | "push"
//   | "sms";

// export interface INotification extends Document {
//   user?: mongoose.Types.ObjectId | null;
//   role?: "user" | "vendor" | "admin" | "all";

//   title: string;
//   message: string;

//   type: NotificationType;
//   channels: NotificationChannel[];

//   entityId?: mongoose.Types.ObjectId;
//   entityType?: "order" | "payout" | "wallet" | "coupon" | "return";

//   isRead: boolean;
//   readAt?: Date;

//   meta?: Record<string, any>;

//   expiresAt?: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const NotificationSchema = new Schema<INotification>(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       default: null, // null => global
//       index: true,
//     },

//     role: {
//       type: String,
//       enum: ["user", "vendor", "admin", "all"],
//       default: "all",
//       index: true,
//     },

//     title: { type: String, required: true },
//     message: { type: String, required: true },

//     type: {
//       type: String,
//       enum: ["order", "payout", "wallet", "coupon", "return", "system", "promotion"],
//       required: true,
//     },

//     channels: {
//       type: [String],
//       default: ["in_app"],
//     },

//     entityId: {
//       type: Schema.Types.ObjectId,
//       index: true,
//     },

//     entityType: {
//       type: String,
//       enum: ["order", "payout", "wallet", "coupon", "return"],
//     },

//     isRead: { type: Boolean, default: false },
//     readAt: Date,

//     meta: { type: Schema.Types.Mixed },

//     expiresAt: Date,
//   },
//   { timestamps: true }
// );

// // Auto delete expired notifications
// NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// export const Notification = mongoose.model<INotification>(
//   "Notification",
//   NotificationSchema
// );

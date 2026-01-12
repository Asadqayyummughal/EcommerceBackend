import { model, Schema, Types } from "mongoose";

const CouponUsageSchema = new Schema({
  coupon: { type: Types.ObjectId, ref: "Coupon" },
  user: { type: Types.ObjectId, ref: "User" },
  order: { type: Types.ObjectId, ref: "Order" },
  usedAt: Date,
});

export const CouponUsage = model("CouponUsage", CouponUsageSchema);

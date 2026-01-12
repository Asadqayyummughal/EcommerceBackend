import { Schema, model, Types } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ["percentage", "flat", "free_shipping"],
      required: true,
    },

    value: Number, // 10% or $20
    minOrderAmount: Number,
    applicableProducts: [{ type: Types.ObjectId, ref: "Product" }],
    applicableCategories: [{ type: Types.ObjectId, ref: "Category" }],

    usageLimit: Number,
    usedCount: { type: Number, default: 0 },

    perUserLimit: Number,

    validFrom: Date,
    validTill: Date,

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = model("Coupon", CouponSchema);

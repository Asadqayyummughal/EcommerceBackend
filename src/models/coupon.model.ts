import { Schema, model, Types } from "mongoose";
export interface ICoupon {
  code: string;
  type: "percentage" | "flat" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  applicableProducts?: Types.ObjectId[]; // or string[] if you prefer lean strings
  applicableCategories?: Types.ObjectId[];
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  validFrom?: Date;
  validTill?: Date;
  isActive: boolean;
  // timestamps (added automatically)
  createdAt?: Date;
  updatedAt?: Date;
}
// ──────────────────────────────────────────────
// 2. If you need Document methods (.save(), .isModified(), etc.)
//    → most people prefer NOT extending Document anymore (official recommendation)
export type CouponDocument = ICoupon & Document;

// ──────────────────────────────────────────────
// 3. The schema itself — let Mongoose infer as much as possible
const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      unique: true,
      uppercase: true, // custom option — works fine
      trim: true, // recommended
    },

    type: {
      type: String,
      enum: ["percentage", "flat", "free_shipping"] as const, // helps TS inference
      required: true,
    },

    value: {
      type: Number,
      required: [
        function (this: ICoupon) {
          return this.type !== "free_shipping";
        },
        "Value is required unless type is free_shipping",
      ],
      min: 0,
    },

    minOrderAmount: {
      type: Number,
      min: 0,
    },

    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    usageLimit: Number,
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    perUserLimit: Number,

    validFrom: Date,
    validTill: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Optional: add indexes if needed
    // indexes: { code: 1 }, // already unique
  }
);

// Optional: custom methods / virtuals / query helpers
// CouponSchema.methods.exampleMethod = function () { ... }
// CouponSchema.virtual('isExpired').get(function () { ... })
// ──────────────────────────────────────────────
// 4. The model
export const Coupon = model<ICoupon>("Coupon", CouponSchema);

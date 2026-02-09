import { Schema, model, Document, Types } from "mongoose";

const commissionSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor", // or 'User' depending on your model name
      required: true,
      index: true,
    },
    orderAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    vendorEarning: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "finalized", "reversed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Useful compound index (very common query pattern)
commissionSchema.index({ vendor: 1, status: 1, createdAt: -1 });

export interface ICommission {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  vendor: Types.ObjectId;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  vendorEarning: number;
  status: "pending" | "finalized" | "reversed";
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionDocument extends ICommission, Document {}

export const Commission = model<ICommissionDocument>(
  "Commission",
  commissionSchema,
);

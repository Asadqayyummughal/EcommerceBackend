import { Schema, model, Document, Types } from "mongoose";
const payoutSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor", // or 'User'
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["stripe", "manual", "bank", "paypal"], // you can extend later
      required: true,
    },
    status: {
      type: String,
      enum: ["requested", "approved", "paid", "failed", "cancelled"],
      default: "requested",
      index: true,
    },
    transactionId: {
      type: String,
      sparse: true, // e.g. Stripe payout ID
    },
    failureReason: {
      type: String,
      sparse: true,
    },
    // requestedByIp?: String,   // optional audit field
    // processedAt?: Date,
  },
  {
    timestamps: true,
  },
);

// Common query patterns
payoutSchema.index({ vendor: 1, status: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 }); // admin dashboard

export interface IPayout {
  _id: Types.ObjectId;
  vendor: Types.ObjectId;
  amount: number;
  method: "stripe" | "manual" | "bank" | "paypal";
  status: "requested" | "approved" | "paid" | "failed" | "cancelled";
  transactionId?: string;
  failureReason?: string;
  requestedByIp?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayoutDocument extends IPayout, Document {}

export const Payout = model<IPayoutDocument>("Payout", payoutSchema);

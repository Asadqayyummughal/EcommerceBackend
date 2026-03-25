import mongoose, { Schema, Document } from "mongoose";

export type ConversionStatus = "pending" | "approved" | "paid" | "reversed";

export interface IAffiliateConversion extends Document {
  affiliate: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  click?: mongoose.Types.ObjectId;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: ConversionStatus;
  reversalReason?: string;
  approvedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateConversionSchema = new Schema<IAffiliateConversion>(
  {
    affiliate: { type: Schema.Types.ObjectId, ref: "Affiliate", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    click: { type: Schema.Types.ObjectId, ref: "AffiliateClick" },
    orderAmount: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "reversed"],
      default: "pending",
    },
    reversalReason: { type: String },
    approvedAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

affiliateConversionSchema.index({ affiliate: 1, status: 1, createdAt: -1 });
affiliateConversionSchema.index({ order: 1 });

export const AffiliateConversion = mongoose.model<IAffiliateConversion>(
  "AffiliateConversion",
  affiliateConversionSchema,
);

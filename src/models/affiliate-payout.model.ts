import mongoose, { Schema, Document } from "mongoose";

export type AffiliatePayoutStatus =
  | "requested"
  | "approved"
  | "paid"
  | "rejected"
  | "failed";

export type AffiliatePayoutMethod = "bank" | "paypal" | "stripe";

export interface IAffiliatePayoutDetails {
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  paypalEmail?: string;
}

export interface IAffiliatePayout extends Document {
  affiliate: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: AffiliatePayoutMethod;
  payoutDetails: IAffiliatePayoutDetails;
  status: AffiliatePayoutStatus;
  failureReason?: string;
  adminNote?: string;
  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const affiliatePayoutSchema = new Schema<IAffiliatePayout>(
  {
    affiliate: { type: Schema.Types.ObjectId, ref: "Affiliate", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    method: { type: String, enum: ["bank", "paypal", "stripe"], required: true },
    payoutDetails: {
      bankName: String,
      accountNumber: String,
      iban: String,
      paypalEmail: String,
    },
    status: {
      type: String,
      enum: ["requested", "approved", "paid", "rejected", "failed"],
      default: "requested",
    },
    failureReason: { type: String },
    adminNote: { type: String },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

affiliatePayoutSchema.index({ affiliate: 1, status: 1, createdAt: -1 });

export const AffiliatePayout = mongoose.model<IAffiliatePayout>(
  "AffiliatePayout",
  affiliatePayoutSchema,
);

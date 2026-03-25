import mongoose, { Schema, Document } from "mongoose";

export type AffiliateStatus = "pending" | "active" | "suspended" | "rejected";
export type AffiliateTier = "bronze" | "silver" | "gold" | "platinum";

export interface IAffiliate extends Document {
  user: mongoose.Types.ObjectId;
  code: string;
  status: AffiliateStatus;
  tier: AffiliateTier;
  commissionRate: number;
  balance: number;
  lockedBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  totalClicks: number;
  totalConversions: number;
  website?: string;
  bio?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateSchema = new Schema<IAffiliate>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    commissionRate: { type: Number, default: 0.05 },
    balance: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalPaidOut: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    website: { type: String, trim: true },
    bio: { type: String, trim: true },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

affiliateSchema.index({ code: 1 });
affiliateSchema.index({ status: 1, createdAt: -1 });

export const Affiliate = mongoose.model<IAffiliate>("Affiliate", affiliateSchema);

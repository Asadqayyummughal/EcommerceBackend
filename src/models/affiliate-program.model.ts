import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliateTierConfig {
  name: string;
  minConversions: number;
  commissionRate: number;
}

export interface IAffiliateProgram extends Document {
  isActive: boolean;
  defaultCommissionRate: number;
  cookieDurationDays: number;
  minPayoutAmount: number;
  conversionApprovalDays: number; // days after delivery before conversion is auto-approved
  tiers: IAffiliateTierConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const affiliateProgramSchema = new Schema<IAffiliateProgram>(
  {
    isActive: { type: Boolean, default: true },
    defaultCommissionRate: { type: Number, default: 0.05 },
    cookieDurationDays: { type: Number, default: 30 },
    minPayoutAmount: { type: Number, default: 50 },
    conversionApprovalDays: { type: Number, default: 14 },
    tiers: [
      {
        name: { type: String, required: true },
        minConversions: { type: Number, required: true },
        commissionRate: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);

export const AffiliateProgram = mongoose.model<IAffiliateProgram>(
  "AffiliateProgram",
  affiliateProgramSchema,
);

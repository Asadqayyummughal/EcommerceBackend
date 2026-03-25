import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliateClick extends Document {
  affiliate: mongoose.Types.ObjectId;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  productId?: mongoose.Types.ObjectId;
  converted: boolean;
  convertedAt?: Date;
  createdAt: Date;
}

const affiliateClickSchema = new Schema<IAffiliateClick>(
  {
    affiliate: { type: Schema.Types.ObjectId, ref: "Affiliate", required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
    referrer: { type: String },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    converted: { type: Boolean, default: false },
    convertedAt: { type: Date },
  },
  { timestamps: true },
);

// Auto-expire click records after 90 days
affiliateClickSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
affiliateClickSchema.index({ affiliate: 1, createdAt: -1 });

export const AffiliateClick = mongoose.model<IAffiliateClick>(
  "AffiliateClick",
  affiliateClickSchema,
);

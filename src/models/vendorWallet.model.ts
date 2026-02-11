import { Schema, model, Document, Types } from "mongoose";
const vendorWalletSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor", // or 'User'
      required: true,
      unique: true, // one wallet per vendor
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Optional: useful for audit / history
    lastPayoutDate: Date,
    lastPayoutAmount: Number,
  },
  {
    timestamps: true,
  },
);

export interface IVendorWallet {
  _id: Types.ObjectId;
  vendor: Types.ObjectId;
  balance: number; // available to withdraw
  lockedBalance: number; // locked (e.g. pending delivery / return window)
  totalEarned: number; // lifetime gross earnings before commissions/deductions
  lastPayoutDate?: Date;
  lastPayoutAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorWalletDocument extends IVendorWallet, Document {}

export const VendorWallet = model<IVendorWalletDocument>(
  "VendorWallet",
  vendorWalletSchema,
);

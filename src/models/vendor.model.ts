import mongoose, { Model, model, Schema } from "mongoose";
// types/vendor.ts
export const VENDOR_STATUS = [
  "pending",
  "active",
  "suspended",
  "rejected",
] as const;
export type VendorStatusType = (typeof VENDOR_STATUS)[number];
export interface IVendor {
  _id?: string;
  name: string;
  user: mongoose.Types.ObjectId; // ObjectId string
  email?: string;
  phone?: string;
  status: VendorStatusType;
  commissionRate: number;
  approvedAt?: string | Date;
  approvedBy?: string; // ObjectId string (admin)
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true, // 1 vendor per user
      required: true,
    },
    email: String,
    phone: String,
    status: {
      type: String,
      enum: VENDOR_STATUS,
      default: "pending",
    },
    commissionRate: {
      type: Number,
      default: 10,
    },
    approvedAt: Date,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // admin
    },
  },
  { timestamps: true },
);
export const Vendor: Model<IVendor> = mongoose.model("Vendor", vendorSchema);

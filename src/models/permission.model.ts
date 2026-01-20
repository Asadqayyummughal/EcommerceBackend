// models/Permission.ts
import mongoose, { Schema } from "mongoose";

export interface IPermission {
  key: string;
  description: string;
  module: string;
}

const PermissionSchema = new Schema<IPermission>(
  {
    key: { type: String, required: true, unique: true },
    description: { type: String },
    module: { type: String, required: true }, // orders, products, coupons
  },
  { timestamps: true }
);

export default mongoose.model("Permission", PermissionSchema);

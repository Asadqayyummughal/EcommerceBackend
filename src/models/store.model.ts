import mongoose, { Schema, Document, Model } from "mongoose";
export const STORE_STATUS = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;
export type STORE_STATUS_TYPE = (typeof STORE_STATUS)[number];
// Optional: Create an interface for better TypeScript support
export interface IStore extends Document {
  vendor: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  status: STORE_STATUS_TYPE;
  policies: {
    shipping?: string;
    returns?: string;
    warranty?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 1. Define the Schema
const StoreSchema = new Schema<IStore>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      unique: true, // one store per vendor
    },

    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      maxlength: [100, "Store name cannot be more than 100 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    logo: {
      type: String,
      default: null,
    },

    banner: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: null,
    },

    status: {
      type: String,
      enum: STORE_STATUS,
      default: "pending",
      index: true, // useful when filtering active stores
    },

    policies: {
      shipping: { type: String, default: null },
      returns: { type: String, default: null },
      warranty: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Optional: Add indexes (in addition to the ones already defined)
StoreSchema.index({ name: "text" }); // if you plan to search by name

// 2. Create and export the model
export const Store: Model<IStore> = mongoose.model<IStore>(
  "Store",
  StoreSchema,
);

// Alternative export style (pick one):
// export default mongoose.model<IStore>('Store', StoreSchema);

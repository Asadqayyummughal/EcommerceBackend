import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProductVariant {
  sku?: string;
  attributes?: Record<string, string>; // e.g. { size: "M", color: "red" }
  price?: number;
  stock?: number;
  images?: string[];
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  sku?: string;
  brand?: string;
  categories: mongoose.Types.ObjectId[]; // ref to Category (optional)
  tags: string[];
  images: string[];
  variants?: IProductVariant[];
  stock: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String },
    attributes: { type: Schema.Types.Mixed },
    price: { type: Number },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    currency: { type: String, default: "USD" },
    sku: { type: String, index: true },
    brand: { type: String },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: String, index: true }],
    images: [{ type: String }],
    variants: [VariantSchema],
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for basic search on title & description
ProductSchema.index({ title: "text", description: "text", tags: "text" });

// Compound indexes for common sorting/filtering
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);
export default Product;

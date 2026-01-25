import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variantSku?: string; // optional (for variants)
  quantity: number;
  price: number; // snapshot price
  vendor: mongoose.Types.ObjectId;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    variantSku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    items: [CartItemSchema],
    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<ICart>("Cart", CartSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  title: string;
  price: number; // snapshot price
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  paymentMethod: "cod" | "stripe" | "paypal";
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zip: string;
  };
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        variantSku: String,
        title: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
      },
    ],
    totalItems: Number,
    subtotal: Number,
    tax: Number,
    shipping: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "cancelled"],
      default: "pending",
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      country: String,
      zip: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);

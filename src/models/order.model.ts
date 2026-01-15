import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  title: string;
  price: number; // snapshot price
  quantity: number;
  subtotal: number;
}
export interface IShipment {
  carrier: string;
  trackingNumber: string;
  shippedAt: Date;
  deliveredAt?: Date;
}
export interface IOrderEvent {
  status: string;
  message: string;
  createdAt: Date;
  createdBy: string;
}
export interface ICoupon {
  code: string;
  discountAmount: number;
}
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "expired"
  | "failed";

export type PaymentMethod = "cod" | "stripe" | "paypal";
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  updatedAt: Date;
  items: IOrderItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId: string;
  inventoryRestored: boolean;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zip: string;
  };
  shipment: IShipment;
  orderEvents: IOrderEvent[];
  coupon: ICoupon;
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
      enum: [
        "pending",
        "processing",
        "paid",
        "shipped",
        "cancelled",
        "delivered",
      ],
      default: "pending",
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
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
    shipment: {
      carrier: { type: String },
      trackingNumber: { type: String },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    orderEvents: [
      {
        status: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    stripePaymentIntentId: String,
    inventoryRestored: { type: Boolean, default: false },
    coupon: {
      code: String,
      discountAmount: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);

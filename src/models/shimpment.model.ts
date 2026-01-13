import { Schema, model, Types } from "mongoose";

export interface IShipment {
  order: Types.ObjectId;
  user: Types.ObjectId;
  carrier: string; // DHL, FedEx, TCS, Leopards
  trackingNumber: string;
  trackingUrl?: string;
  items: {
    product: Types.ObjectId;
    variantSku?: string;
    quantity: number;
  }[];

  status: "pending" | "shipped" | "delivered";
  shippedAt?: Date;
  deliveredAt?: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    carrier: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    trackingUrl: String,
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        variantSku: String,
        quantity: Number,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },

    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default model<IShipment>("Shipment", ShipmentSchema);

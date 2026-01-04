import mongoose, { Schema } from "mongoose";

const ShipmentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    carrier: {
      type: String, // TCS, DHL, FedEx, Leopard
      required: true,
    },

    trackingNumber: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "picked", "in_transit", "delivered", "failed"],
      default: "pending",
    },

    shippedAt: Date,
    deliveredAt: Date,

    metadata: Schema.Types.Mixed, // courier response, label URL, etc.
  },
  { timestamps: true }
);
export default mongoose.model("Shipment", ShipmentSchema);

import { Schema, model, Types } from "mongoose";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "picked_up"
  | "received"
  | "refunded"
  | "replaced";

const ReturnSchema = new Schema(
  {
    order: {
      type: Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: { type: Types.ObjectId, ref: "Product" },
        variantSku: String,
        quantity: { type: Number, required: true },
        reason: {
          type: String,
          enum: [
            "damaged",
            "wrong_item",
            "not_as_described",
            "size_issue",
            "other",
          ],
          required: true,
        },
        condition: {
          type: String,
          enum: ["new", "opened", "damaged"],
          required: true,
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "requested",
        "approved",
        "rejected",
        "picked_up",
        "received",
        "refunded",
        "replaced",
      ],
      default: "requested",
    },

    refundAmount: Number,

    refundMethod: {
      type: String,
      enum: ["original", "wallet", "manual"],
    },

    adminNote: String,
  },
  { timestamps: true }
);

export const Return = model("Return", ReturnSchema);

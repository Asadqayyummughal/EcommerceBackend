import { Schema, model, Document, Types } from "mongoose";
export const PAYOUT_STATUS = [
  "requested",
  "approved",
  "paid",
  "failed",
  "cancelled",
  "rejected",
] as const;
export type PayoutStatusType = (typeof PAYOUT_STATUS)[number];

export const PAYMENT_METHOD = ["stripe", "manual", "bank", "paypal"];
export type PaymentaMethodType = (typeof PAYMENT_METHOD)[number];
const payoutSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor", // or 'User'
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,

      // You can add enum if you want to restrict to supported currencies
    },
    method: {
      type: String,
      enum: PAYMENT_METHOD, // you can extend later
      required: true,
    },
    payoutDetails: {
      bankName: String,
      accountNumber: String,
      iban: String,
      paypalEmail: String,
    },
    status: {
      type: String,
      enum: PAYOUT_STATUS,
      default: "requested",
      index: true,
    },
    transactionId: {
      type: String,
      sparse: true, // e.g. Stripe payout ID
    },
    stripeTransferId: String,
    stripePayoutId: String,
    failureReason: {
      type: String,
      sparse: true,
    },

    // requestedByIp?: String,   // optional audit field
    //processedAt?: Date,
    requestedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Common query patterns
payoutSchema.index({ vendor: 1, status: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 }); // admin dashboard

export interface IPayout {
  _id: Types.ObjectId;
  vendor: Types.ObjectId;
  amount: number;
  currency?: string;
  method: PaymentaMethodType;
  payoutDetails: {
    bankName: string;
    accountNumber: string;
    iban: string;
    paypalEmail: string;
  };
  status: PayoutStatusType;
  transactionId?: string;
  failureReason?: string;
  requestedByIp?: string;
  stripeTransferId?: string;
  stripePayoutId?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  requestedAt: Date;
}

export interface IPayoutDocument extends IPayout, Document {}

export const Payout = model<IPayoutDocument>("Payout", payoutSchema);

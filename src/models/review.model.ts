import {
  Schema,
  model,
  Types,
  HydratedDocument,
  InferSchemaType,
} from "mongoose";

// 1. Raw document shape (what you store / get with .lean())
export interface Review {
  user: Types.ObjectId;
  product: Types.ObjectId;
  order: Types.ObjectId;

  rating: number;
  comment?: string;

  isApproved: boolean;

  // Automatic from { timestamps: true }
  createdAt: Date;
  updatedAt: Date;

  // If you ever add _id manually (rare)
  _id: Types.ObjectId;
}

// 2. Hydrated document (instance with .save(), .populate(), virtuals, methods…)
export type ReviewDocument = HydratedDocument<Review>;

// 3. Model type
export type ReviewModel = typeof Review; // or Model<ReviewDocument> if you prefer explicit

// ────────────────────────────────────────────────
//               Schema (your original + types)
const ReviewSchema = new Schema<Review>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);
// Prevent duplicate reviews (user + product)
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
// 4. Model
export const Review = model<Review>("Review", ReviewSchema);
// Optional: if you want lean type inference without HydratedDocument
export type ReviewLean = InferSchemaType<typeof ReviewSchema>;

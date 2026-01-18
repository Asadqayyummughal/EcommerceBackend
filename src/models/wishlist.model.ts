// models/wishlist.model.ts
import { Schema, model, Document, Types } from "mongoose";

// 1. Define the document interface
export interface IWishlist extends Document {
  user: Types.ObjectId; // or string if you store it as string
  products: Types.ObjectId[]; // array of product IDs
}

// 2. Define the schema
const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // change to your actual User model name
      required: true,
      index: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

// 3. Create & export the model
const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;

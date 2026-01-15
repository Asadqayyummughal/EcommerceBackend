import mongoose from "mongoose";
import Order from "../models/order.model";
import Product from "../models/product.model";
import { Review } from "../models/reviews.model";

export const addProductReviews = async (
  orderId: string,
  userId: string,
  review: { desc: string; rating: number }
) => {
  try {
    if (!orderId) throw new Error("Product id missing");
    let product = Order.findOne({ user: userId });
    if (!product) throw new Error("Product not exist");
  } catch (excep) {
    throw excep;
  }
};

const recalcProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
      },
    },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0]?.avg || 0,
    reviewCount: stats[0]?.count || 0,
  });
};

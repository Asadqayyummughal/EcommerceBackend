import Order from "../models/order.model";
import Product from "../models/product.model";
import mongoose from "mongoose";
import { Review } from "../models/review.model";
import { AppError } from "../utils/AppError";

export const createReview = async (
  userId: string,
  orderId: string,
  productId: string,
  rating: number,
  comment?: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: "delivered",
    }).session(session);
    if (!order) {
      throw new AppError("Order not eligible for review", 400);
    }
    const orderedItem = order.items.find(
      (item: any) => item.product.toString() === productId
    );

    if (!orderedItem) {
      throw new AppError("Product not found in order", 404);
    }

    const review = await Review.create(
      [
        {
          user: userId,
          order: orderId,
          product: productId,
          rating,
          comment,
        },
      ],
      { session }
    );

    await recalcProductRating(productId, session);

    await session.commitTransaction();
    session.endSession();

    return review[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getProductReviews = async (
  productId: string,
  page: number,
  limit: number
) => {
  const reviews = await Review.find({
    product: productId,
    isApproved: true,
  })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Review.countDocuments({
    product: productId,
    isApproved: true,
  });
  const pagination = {
    docsCount: total,
    pageNo: page,
    totalPages: Math.ceil(total / limit),
  };

  return { reviews, pagination };
};

export const updateReview = async (
  userId: string,
  reviewId: string,
  rating: number,
  comment: string
) => {
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) throw new AppError("Review not found", 404);

  review.rating = rating;
  review.comment = comment;

  await review.save();
  await recalcProductRating(review.product.toString());

  return review;
};

export const recalcProductRating = async (
  productId: string,
  session?: mongoose.ClientSession
) => {
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
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  await Product.findByIdAndUpdate(
    productId,
    {
      averageRating: stats[0]?.avgRating || 0,
      reviewCount: stats[0]?.count || 0,
    },
    { session }
  );
};

export const deleteReview = async (
  userId: string,
  reviewId: string,
  isAdmin = false
) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);
  if (!isAdmin && review.user.toString() !== userId) {
    throw new AppError("Unauthorized", 403);
  }
  let res = await review.deleteOne();
  await recalcProductRating(review.product.toString());
  return res;
};

export const getAllReviews = async () => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  return reviews;
};

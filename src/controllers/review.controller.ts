import { Request, Response } from "express";
import * as reviewService from "../services/review.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, productId, rating, comment } = req.body;
  const review = await reviewService.createReview(req.user.id, orderId, productId, rating, comment);
  res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await reviewService.getProductReviews(id, page, limit);
  res.json({ success: true, data: result.reviews, pagination: result.pagination });
});

export const getAllReviews = asyncHandler(async (_req: Request, res: Response) => {
  const result = await reviewService.getAllReviews();
  res.json({ success: true, data: result });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const review = await reviewService.updateReview(req.user.id, id, rating, comment);
  res.json({ success: true, message: "Review updated successfully", data: review });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await reviewService.deleteReview(req.user.id, id);
  res.json({ success: true, message: "Review deleted successfully", data: result });
});

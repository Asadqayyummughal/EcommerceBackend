import { Request, Response } from "express";
import * as reveiwService from "../services/review.service";
export const createReview = async (req: Request, res: Response) => {
  try {
    const { orderId, productId, rating, comment } = req.body;
    let review = await reveiwService.createReview(
      req.user.id,
      orderId,
      productId,
      rating,
      comment
    );
    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    let result = await reveiwService.getProductReviews(id, page, limit);
    res.status(201).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.mssage,
    });
  }
};
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    //check user role
    let result = await reveiwService.getAllReviews();
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.mssage,
    });
  }
};
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("checkReviewId===>", id);
    const { rating, comment } = req.body;
    let reviews = await reveiwService.updateReview(
      req.user.id,
      id,
      rating,
      comment
    );
    res.status(201).json({
      success: true,
      message: "Review updated successfully",
      data: reviews,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.mssage,
    });
  }
};
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let result = await reveiwService.deleteReview(req.user.id, id);
    res.status(201).json({
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.mssage,
    });
  }
};

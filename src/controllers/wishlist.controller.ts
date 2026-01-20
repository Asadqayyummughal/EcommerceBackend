import { Request, Response } from "express";
import * as wishlistService from "../services/wishlist.service";

export const toggleWishlistController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const wishlist = await wishlistService.toggleWishlistItem(
      req.user.id,
      productId
    );

    res.json({
      success: true,
      count: wishlist.products.length,
      data: wishlist.products,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWishlistController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await wishlistService.getWishlist(req.user.id, page, limit);
    res.json({
      success: true,
      count: result.count,
      data: result.data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteWishlistController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const result = await wishlistService.deleteWishlist(req.user.id, productId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

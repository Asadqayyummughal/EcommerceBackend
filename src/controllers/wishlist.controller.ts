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

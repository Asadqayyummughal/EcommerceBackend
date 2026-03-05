import { Request, Response } from "express";
import * as wishlistService from "../services/wishlist.service";
import { asyncHandler } from "../utils/asyncHandler";

export const toggleWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body;
  const wishlist = await wishlistService.toggleWishlistItem(req.user.id, productId);
  res.json({ success: true, data: wishlist.products });
});

export const getWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await wishlistService.getWishlist(req.user.id, page, limit);
  res.json({ success: true, data: result.data, count: result.count });
});

export const deleteWishlistController = asyncHandler(async (req: Request, res: Response) => {
  const result = await wishlistService.deleteWishlist(req.user.id, req.params.productId);
  res.json({ success: true, data: result });
});

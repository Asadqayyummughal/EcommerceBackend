import { Request, Response } from "express";
import * as cartService from "../services/cart.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCartService(req.user.id);
  res.json({ success: true, data: cart });
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity, variantSku } = req.body;
  if (!productId || !quantity || !variantSku) {
    throw new AppError("productId, quantity and variantSku are required", 400);
  }
  const cart = await cartService.addToCartService(
    req.user.id,
    productId,
    quantity,
    variantSku,
    req.user.role.toString(),
  );
  res.json({ success: true, data: cart });
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity, variantSku } = req.body;
  const cart = await cartService.updateCartItemService(req.user.id, productId, quantity, variantSku);
  res.json({ success: true, data: cart });
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, variantSku } = req.body;
  const cart = await cartService.removeCartItemService(req.user.id, productId, variantSku);
  res.json({ success: true, data: cart });
});

export const syncCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.syncCartService(req.user.id, req.body.items);
  res.json({ success: true, message: "Cart synced successfully", data: cart });
});

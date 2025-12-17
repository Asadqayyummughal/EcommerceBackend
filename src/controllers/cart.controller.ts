import { Request, Response } from "express";
import * as cartService from "../services/cart.service";

export const getCart = async (req: Request, res: Response) => {
  const cart = await cartService.getCartService(req.user.id);
  return res.json(cart);
};

export const addToCart = async (req: Request, res: Response) => {
  const { productId, quantity, variantSku } = req.body;
  if (!productId || !quantity || !variantSku) {
    throw new Error("missing creds");
  }
  const cart = await cartService.addToCartService(
    req.user.id,
    productId,
    quantity,
    variantSku
  );
  res.json(cart);
};

export const updateCartItem = async (req: Request, res: Response) => {
  const { productId, quantity, variantSku } = req.body;
  const cart = await cartService.updateCartItemService(
    req.user.id,
    productId,
    quantity,
    variantSku
  );
  res.json(cart);
};

export const removeCartItem = async (req: Request, res: Response) => {
  const { productId, variantSku } = req.body;
  const cart = await cartService.removeCartItemService(
    req.user.id,
    productId,
    variantSku
  );
  res.json(cart);
};

export const syncCart = async (req: Request, res: Response) => {
  const cart = await cartService.syncCartService(req.user.id, req.body.items);

  res.status(200).json({
    message: "Cart synced successfully",
    cart,
  });
};

import { Request, Response } from "express";
import { checkoutService } from "../services/checkout.service";

export const checkout = async (req: Request, res: Response) => {
  const order = await checkoutService(req.user.id, req.body);
  res.status(201).json(order);
};

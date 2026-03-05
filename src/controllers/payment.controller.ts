import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createStripeIntent = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const result = await paymentService.createStripePaymentIntent(orderId);
  res.json({ success: true, data: result });
});

export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const { paymentIntentId, payment_method } = req.body;
  const result = await paymentService.confirmPayment(paymentIntentId, payment_method);
  res.json({ success: true, data: result });
});

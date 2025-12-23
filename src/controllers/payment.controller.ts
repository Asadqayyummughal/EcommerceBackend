import { Request, Response } from "express";
import * as paymentController from "../services/payment.service";

export const createStripeIntent = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const result = await paymentController.createStripePaymentIntent(orderId);

  res.json(result);
};
export const confirmPayment = async (req: Request, res: Response) => {
  const { paymentIntentId, payment_method } = req.body;

  const result = await paymentController.confirmPayment(
    paymentIntentId,
    payment_method
  );

  res.json(result);
};

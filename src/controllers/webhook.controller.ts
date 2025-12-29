import Stripe from "stripe";
import Order from "../models/order.model";
import mongoose from "mongoose";
import { restoreInventory } from "../services/inventory.service";
import { Request, Response } from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error`);
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;

      const order = await Order.findOne({
        stripePaymentIntentId: intent.id,
      }).session(session);

      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.status = "paid";
        await order.save({ session });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;

      const order = await Order.findOne({
        stripePaymentIntentId: intent.id,
      }).session(session);

      if (order && !order.inventoryRestored) {
        await restoreInventory(order, session);
        order.inventoryRestored = true;
        order.paymentStatus = "failed";
        order.status = "cancelled";
        await order.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ received: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Webhook processing failed");
  }
};

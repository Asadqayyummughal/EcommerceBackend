import Stripe from "stripe";
import Order, { IOrder } from "../models/order.model";
import mongoose from "mongoose";

import { Request, Response } from "express";
import { restoreInventory } from "../utils/restore-inventory";
import { appEventEmitter } from "../events/appEvents";
import Product from "../models/product.model";

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
        let orderId = order._id;
        let userId = order.user;
        await finalizeStock(order);
        await order.save({ session });
        appEventEmitter.emit("order.placed", {
          orderId,
          userId,
        });
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

const finalizeStock = async (order: IOrder) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      if (item.variantSku) {
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (variant) {
          variant.stock -= item.quantity;
          variant.reservedStock -= item.quantity;
        }
      } else {
        product.stock -= item.quantity;
        product.reservedStock -= item.quantity;
      }
      await product.save();
    }
  }
};

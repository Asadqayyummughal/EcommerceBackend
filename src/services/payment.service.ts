import Stripe from "stripe";
import Order from "../models/order.model";
import { AppError } from "../utils/AppError";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const createStripePaymentIntent = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.paymentStatus === "paid") {
    throw new AppError("Order already paid", 400);
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // cents
    currency: "usd",
    payment_method_types: ["card"], // Explicitly allow card payments
    description: "Test E-commerce Purchase",
    metadata: {
      orderId: order._id.toString(),
      userId: order.user.toString(),
    },
  });
  order.stripePaymentIntentId = paymentIntent.id;
  await order.save();

  return {
    clientSecret: paymentIntent.client_secret,
  };
};

export const confirmPayment = async (
  paymentIntentId: string,
  payment_method: any,
) => {
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: "pm_card_visa", // This simulates 4242 4242 4242 4242 (successful charge)
  });

  if (paymentIntent.status === "succeeded") {
    return { success: true, message: "Payment succeeded!" };
  } else {
    return { success: false, status: paymentIntent.status };
  }
};

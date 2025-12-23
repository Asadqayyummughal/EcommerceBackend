import Stripe from "stripe";
import Order from "../models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const createStripePaymentIntent = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.paymentStatus === "paid") {
    throw new Error("Order already paid");
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
  console.log("checkout paymentIntend===================>", paymentIntent.id);
  order.stripePaymentIntentId = paymentIntent.id;
  await order.save();

  return {
    clientSecret: paymentIntent.client_secret,
  };
};

export const confirmPayment = async (
  paymentIntentId: string,
  payment_method: any
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: payment_method,
    });

    if (paymentIntent.status === "succeeded") {
      return { success: true, message: "Payment succeeded!" };
    } else {
      return { success: false, status: paymentIntent.status };
    }
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
};

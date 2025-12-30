import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const refundStripePayment = async (paymentIntentId: string) => {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });
};

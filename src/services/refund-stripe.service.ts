import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const refundStripePayment = async (
  paymentIntentId: string,
  orderId: string
) => {
  const refund = await stripe.refunds.create(
    {
      payment_intent: paymentIntentId,
      reason: "requested_by_customer", // optional but good
      // amount: ... // if ever partial
    },
    {
      idempotencyKey: `refund-${orderId}`, // unique per order/refund attempt
    }
  );

  if (refund.status !== "succeeded") {
    throw new Error(`Refund not succeeded: status ${refund.status}`);
  }

  return refund;
};

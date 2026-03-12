import Stripe from "stripe";
import { AppError } from "../utils/AppError";

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
    throw new AppError(`Refund not succeeded: status ${refund.status}`, 502);
  }

  return refund;
};

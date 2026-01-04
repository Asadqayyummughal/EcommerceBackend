import Stripe from "stripe";
import cron from "node-cron";
import mongoose from "mongoose";
import Order from "../models/order.model"; // Adjust to your model path
import { restoreInventory } from "../utils/restore-inventory";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// Reconciliation function (run periodically)
export const reconcileOrders = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Fetch recent payment intents from Stripe (e.g., last 48 hours to cover retries)
    const twoDaysAgo = Math.floor(Date.now() / 1000) - 48 * 60 * 60; // Unix timestamp
    const paymentIntents = await stripe.paymentIntents.list({
      created: { gte: twoDaysAgo },
      limit: 100, // Adjust based on volume; paginate if >100
    });
    for (const intent of paymentIntents.data) {
      const order = await Order.findOne({
        stripePaymentIntentId: intent.id,
      }).session(session);
      if (!order) continue; // No matching order; skip (e.g., test event)

      // Check for mismatches and sync
      if (intent.status === "succeeded" && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.status = "paid";
        await order.save({ session });
        console.log(`Reconciled succeeded payment for order ${order._id}`);
      } else if (
        intent.status === "requires_capture" ||
        intent.status === "requires_confirmation"
      ) {
        // Handle partial states if needed (e.g., async capture); adjust based on your flow
      } else if (
        [
          "requires_payment_method",
          "requires_action",
          "processing",
          "canceled",
        ].includes(intent.status) &&
        order.paymentStatus !== "failed"
      ) {
        // Treat as failed/canceled if not succeeded
        if (!order.inventoryRestored) {
          await restoreInventory(order, session);
          order.inventoryRestored = true;
        }
        order.paymentStatus = "failed";
        order.status = "cancelled";
        await order.save({ session });
        console.log(
          `Reconciled failed/canceled payment for order ${order._id}`
        );
      }
    }

    await session.commitTransaction();
    console.log("Reconciliation completed successfully");
  } catch (error) {
    await session.abortTransaction();
    console.error("Reconciliation failed:", error);
    // Optional: Notify admins (e.g., via email/Slack)
  } finally {
    session.endSession();
  }
};

// Schedule the job (e.g., every 30 minutes)
cron.schedule("*/30 * * * *", reconcileOrders);

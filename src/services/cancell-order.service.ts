import mongoose from "mongoose";
import Order from "../models/order.model";
import { refundStripePayment } from "./refund-stripe.service";
import { restoreInventory } from "./inventory.service";

export const cancelOrderService = async (orderId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).session(
      session
    );
    if (!order) throw new Error("Order not found");

    if (order.status === "cancelled")
      throw new Error("Order already cancelled");

    if (order.status === "shipped")
      throw new Error("Shipped orders cannot be cancelled");

    // 🔁 Refund if paid
    if (order.paymentStatus === "paid") {
      await refundStripePayment(order.stripePaymentIntentId);
      order.paymentStatus = "refunded";
    }

    // ♻ Restore inventory
    await restoreInventory(order.items, session);

    order.status = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

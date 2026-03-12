import mongoose from "mongoose";
import Order from "../models/order.model";
import { refundStripePayment } from "./refund-stripe.service";
import { restoreInventory } from "../utils/restore-inventory";
import { AppError } from "../utils/AppError";

export const cancelOrderService = async (orderId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).session(
      session
    );
    if (!order) throw new AppError("Order not found", 404);

    if (order.status === "cancelled")
      throw new AppError("Order already cancelled", 400);

    if (order.status === "shipped")
      throw new AppError("Shipped orders cannot be cancelled", 400);

    // 🔁 Refund if paid
    if (order.paymentStatus === "paid") {
      await refundStripePayment(order.stripePaymentIntentId, orderId);
      order.paymentStatus = "refunded";
    }
    // ♻ Restore inventory
    await restoreInventory(order, session);
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

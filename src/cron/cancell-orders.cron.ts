import cron from "node-cron";
import Order from "../models/order.model";
import mongoose from "mongoose";
import { restoreInventory } from "../services/inventory.service";
cron.schedule("*/5 * * * *", async () => {
  console.log("⏱ Running unpaid order cleanup");

  const expiryTime = new Date(Date.now() - 15 * 60 * 1000);

  const orders = await Order.find({
    status: "pending",
    paymentStatus: "pending",
    createdAt: { $lt: expiryTime },
  });

  for (const order of orders) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      //   await restoreInventory(order.items, session);
      order.status = "cancelled";
      await order.save({ session });
      await session.commitTransaction();
    } catch {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
});

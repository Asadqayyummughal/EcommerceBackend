// src/events/listeners/order-created.listener.ts

import Order from "../../models/order.model";
import User from "../../models/user.model";
import { sendEmail } from "../../services/email.service";

import { appEventEmitter } from "../appEvents";

console.log("[EVENT] Order created listener registered");

appEventEmitter.on(
  "order.status.changed",
  async ({ orderId, newStatus, userId }) => {
    const user = await User.findById(userId);
    const order = await Order.findById(orderId).populate("user");
    if (!order) return;
    if (!user?.email) return;
    await sendEmail(
      user.email,
      `Order ${newStatus.toUpperCase()}`,
      `<p>Your order is now <strong>${newStatus}</strong>.</p>`
    );
  }
);

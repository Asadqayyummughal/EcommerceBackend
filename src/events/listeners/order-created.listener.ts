import { appEventEmitter } from "../appEvents";
import Order from "../../models/order.model";
import User from "../../models/user.model";
import { orderPlacedTemplate } from "../../templates";
import { sendEmail } from "../../services/email.service";
appEventEmitter.on("order.placed", async ({ orderId, userId }) => {
  const order = await Order.findById(orderId).populate("items.product");
  const user = await User.findById(userId);
  if (!order || !user) return;
  const html = orderPlacedTemplate({
    userName: user.name,
    order,
  });
  debugger;
  console.log("checkout user name===>", user.email);
  console.log("checkout order=====>", order);
  if (!user?.email) return;
  await sendEmail(user.email, `Order ${order.status.toUpperCase()}`, html);
});

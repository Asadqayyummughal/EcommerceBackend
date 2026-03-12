import Order from "../../models/order.model";
import Shipment from "../../models/shimpment.model";
import { AppError } from "../../utils/AppError";

export const createShipment = async (payload: {
  carrier: string;
  trackingNumber: string;
  orderId: "string";
}) => {
  const orderId = payload.orderId;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.status !== "processing")
    throw new AppError("Order must be in processing state", 400);
  const carrier = payload.carrier;
  const trackingNumber = payload.trackingNumber;
  orderId;
  const items = order.items;
  const shipment = await Shipment.create({
    order: order._id,
    user: order.user,
    carrier,
    trackingNumber,
    items,
  });
  return shipment;
};

export const markShipmentDelivered = async (shipmentId: string) => {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) throw new AppError("Shipment not found", 404);

  shipment.status = "delivered";
  shipment.deliveredAt = new Date();

  await shipment.save();

  await Order.findByIdAndUpdate(shipment.order, {
    status: "delivered",
  });

  return shipment;
};

export const markShipmentShipped = async (shipmentId: string) => {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) throw new AppError("Shipment not found", 404);

  shipment.status = "shipped";
  shipment.shippedAt = new Date();

  await shipment.save();

  // 🔁 Update order status
  await Order.findByIdAndUpdate(shipment.order, {
    status: "shipped",
  });

  return shipment;
};

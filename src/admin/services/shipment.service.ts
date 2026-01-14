import Order from "../../models/order.model";
import Shipment from "../../models/shimpment.model";

export const createShipment = async (payload: {
  carrier: string;
  trackingNumber: string;
  orderId: "string";
}) => {
  const orderId = payload.orderId;
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status !== "processing")
    throw new Error("Order must be in processing state");
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
  if (!shipment) throw new Error("Shipment not foulnd");

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
  if (!shipment) throw new Error("Shipment not found");

  shipment.status = "shipped";
  shipment.shippedAt = new Date();

  await shipment.save();

  // 🔁 Update order status
  await Order.findByIdAndUpdate(shipment.order, {
    status: "shipped",
  });

  return shipment;
};

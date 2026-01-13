import Cart from "../models/cart.model";
import Product from "../models/product.model";
import Order, { OrderStatus } from "../models/order.model";
import mongoose from "mongoose";
import { AuthUser } from "../types/express";
import { refundStripePayment } from "./refund-stripe.service";
import { restoreInventory } from "../utils/restore-inventory";
import { appEventEmitter } from "../events/appEvents";
import { validateCoupon } from "./coupon.service";
import { getEligibleItems } from "./couponEligibility";
import { calculateDiscount } from "./couponCalculator";
import { Coupon } from "../models/coupon.model";
import { CouponUsage } from "../models/couponUsage.model";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  failed: [],
  expired: [],
};

export const checkoutOrder = async (
  userId: string,
  payload: {
    paymentMethod: "cod" | "stripe" | "paypal";
    shippingAddress: any;
    couponCode: string;
  }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: userId }).session(session); //user cart
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty"); //validate cart
    const orderItems = [];
    let subtotal = 0;
    for (const item of cart.items) {
      //validate stock
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isActive) throw new Error("Product unavailable");
      let price = product.salePrice ?? product.price;
      if (item.variantSku) {
        const variant = product.variants?.find(
          (v) => v.sku === item.variantSku
        );
        if (variant && variant.stock && variant.stock >= item.quantity) {
          price = variant.price ?? price;
          variant.stock -= item.quantity;
        } else {
          throw new Error("Variant out of stock");
        }
      } else {
        if (product.stock < item.quantity)
          throw new Error("Product out of stock");
        product.stock -= item.quantity;
      }
      await product.save({ session });
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        product: product._id,
        variantSku: item.variantSku,
        title: product.title,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }
    const tax = subtotal * 0.1; //lock price
    const shipping = subtotal > 100 ? 0 : 10;
    let totalAmount = subtotal + tax + shipping;
    //coupon logic
    const coupon = payload.couponCode
      ? await validateCoupon(payload.couponCode, cart, userId)
      : null;
    let discountAmount = 0;
    if (coupon) {
      const eligibleItems = getEligibleItems(orderItems, coupon);
      if (eligibleItems.length === 0) throw new Error("Coupon not applicable");
      const discountData = calculateDiscount(coupon, eligibleItems);
      discountAmount = discountData.discount;
      totalAmount -= discountAmount;
    }

    const order = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalItems: cart.totalItems,
          subtotal,
          tax,
          shipping,
          totalAmount,
          paymentMethod: payload.paymentMethod,
          shippingAddress: payload.shippingAddress,
          coupon: coupon
            ? {
                code: coupon.code,
                discountAmount,
              }
            : undefined,
        },
      ],
      { session }
    );

    if (coupon) {
      await Coupon.updateOne(
        { _id: coupon._id },
        { $inc: { usedCount: 1 } },
        { session }
      );

      await CouponUsage.create(
        [
          {
            coupon: coupon._id,
            user: userId,
            order: order[0]._id,
            usedAt: new Date(),
          },
        ],
        { session }
      );
    }

    // 🔥 Clear cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getUserOrders = async (userId: string) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getOrderById = async (user: AuthUser, orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  // User can only view their own order
  if (order.user.toString() !== user.id) {
    //&& user.role !== "admin"
    throw new Error("Unauthorized");
  }

  return order;
};

export const cancelOrder = async (userId: string, orderId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");
    // 🔐 Ownership check
    if (order.user.toString() !== userId) throw new Error("Unauthorized");
    // 🚫 Prevent invalid cancellations
    if (["shipped", "delivered"].includes(order.status)) {
      throw new Error("Shipped orders cannot be cancelled");
    }
    if (order.status === "cancelled") {
      throw new Error("Order already cancelled");
    }
    // 🔁 Refund if paid
    if (order.paymentStatus === "paid") {
      await refundStripePayment(
        order.stripePaymentIntentId,
        order._id.toString()
      );

      order.paymentStatus = "refunded";
    }
    // 🔁 Restore inventory ONLY once
    await restoreInventory(order, session);
    order.status = "cancelled";
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");

    const allowedNextStatuses =
      ALLOWED_TRANSITIONS[order.status as OrderStatus] || [];

    if (!allowedNextStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${order.status} → ${newStatus}`
      );
    }

    // 🔁 Restore inventory ONLY on cancellation-like states
    const restoreStates: OrderStatus[] = ["cancelled", "failed", "expired"];

    if (
      restoreStates.includes(newStatus) &&
      !restoreStates.includes(order.status)
    ) {
      await restoreInventory(order, session);
      if (order.coupon?.code) {
        await Coupon.updateOne(
          { code: order.coupon.code },
          { $inc: { usedCount: -1 } },
          { session }
        );

        await CouponUsage.deleteOne({ order: order._id }).session(session);
      }
    }

    order.status = newStatus;

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    appEventEmitter.emit("order.status.changed", {
      orderId,
      newStatus,
      userId,
    });
    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const shipOrder = async (
  orderId: string,
  payload: { carrier: string; trackingNumber: string },
  adminId: string
) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status !== "processing") {
    throw new Error("Order not ready for shipment");
  }
  order.status = "shipped";
  order.shipment = {
    carrier: payload.carrier,
    trackingNumber: payload.trackingNumber,
    shippedAt: new Date(),
  };

  order.orderEvents.push({
    status: "shipped",
    message: "Order shipped",
    createdAt: new Date(),
    createdBy: adminId,
  });

  await order.save();
  return order;
};

export const deliverOrder = async (orderId: string, adminId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.status !== "shipped") {
    throw new Error("Order not shipped yet");
  }

  order.status = "delivered";
  order.shipment.deliveredAt = new Date();

  order.orderEvents.push({
    status: "delivered",
    message: "Order delivered successfully",
    createdAt: new Date(),
    createdBy: adminId,
  });

  await order.save();
  return order;
};

export const getOrderTracking = async (orderId: string, userId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).select("status shipment orderEvents");
  if (!order) throw new Error("Order not found");
  return order;
};

// create shipment
// export const createShipmentService = async (
//   orderId: string,
//   payload: {
//     carrier: string;
//     trackingNumber: string;
//     metadata?: any;
//   }
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const order = await Order.findById(orderId).session(session);
//     if (!order) throw new Error("Order not found");

//     if (order.status !== "processing") {
//       throw new Error("Order is not ready for shipment");
//     }

//     const shipment = await Shipment.create(
//       [
//         {
//           order: order._id,
//           carrier: payload.carrier,
//           trackingNumber: payload.trackingNumber,
//           status: "picked",
//           shippedAt: new Date(),
//           metadata: payload.metadata,
//         },
//       ],
//       { session }
//     );

//     order.shipments.push(shipment[0]._id);
//     order.status = "shipped";

//     await order.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return shipment[0];
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };
// export const updateShipmentStatus = async (
//   shipmentId: string,
//   status: ShipmentStatus
// ) => {
//   const shipment = await Shipment.findById(shipmentId);
//   if (!shipment) throw new Error("Shipment not found");

//   shipment.status = status;

//   if (status === "delivered") {
//     shipment.deliveredAt = new Date();

//     await Order.findByIdAndUpdate(shipment.order, {
//       status: "delivered",
//     });
//   }

//   await shipment.save();
//   return shipment;
// };

import Cart from "../models/cart.model";
import Product from "../models/product.model";
import Order, { IOrder, IOrderItem, OrderStatus } from "../models/order.model";
import mongoose, { ClientSession } from "mongoose";
import { AuthUser } from "../types/express";
import { refundStripePayment } from "./refund-stripe.service";
import { restoreInventory } from "../utils/restore-inventory";
import { appEventEmitter } from "../events/appEvents";
import { validateCoupon } from "./coupon.service";
import { getEligibleItems } from "./couponEligibility";
import { calculateDiscount } from "./couponCalculator";
import { Coupon } from "../models/coupon.model";
import { CouponUsage } from "../models/couponUsage.model";
import { VendorWallet } from "../models/vendorWallet.model";
import { Commission } from "../models/commission.model";
import { sendRealtimeNotification } from "../utils/notifications";

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
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: userId }).session(session); //user cart
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty"); //validate cart
    const orderItems: IOrderItem[] = [];
    let subtotal = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isActive) throw new Error("Product unavailable");
      let price = product.salePrice ?? product.price;
      if (item.variantSku) {
        const variant = product.variants?.find(
          (v) => v.sku === item.variantSku,
        );
        if (!variant) throw new Error("Variant not found");
        const available = variant.stock - (variant.reservedStock ?? 0);
        if (available < item.quantity) {
          throw new Error("Variant out of stock");
        }
        price = variant.price ?? price;
        variant.reservedStock = (variant.reservedStock ?? 0) + item.quantity;
      } else {
        const available = product.stock - (product.reservedStock ?? 0);
        if (available < item.quantity) {
          throw new Error("Product out of stock");
        }
        product.reservedStock = (product.reservedStock ?? 0) + item.quantity;
      }
      await product.save({ session });
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        product: product._id,
        vendor: product.vendor,
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
      { session },
    );
    if (coupon) {
      await Coupon.updateOne(
        { _id: coupon._id },
        { $inc: { usedCount: 1 } },
        { session },
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
        { session },
      );
    }
    // 🔥 Clear cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save({ session });
    await session.commitTransaction();
    session.endSession();
    sendRealtimeNotification(userId, {
      message: "new order placed",
      orderDetial: order[0],
    });
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
        order._id.toString(),
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
  userId: string,
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");

    const allowedNextStatuses =
      ALLOWED_TRANSITIONS[order.status as OrderStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${order.status} → ${newStatus}`,
      );
    }

    // Restore inventory if needed
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
          { session },
        );
        await CouponUsage.deleteOne({ order: order._id }).session(session);
      }
    }
    // Update status in memory
    order.status = newStatus;
    // Save the order FIRST → persist status change
    await order.save({ session });
    // Now safe to emit event and credit wallet (order is persisted)
    appEventEmitter.emit("order.status.changed", {
      orderId,
      newStatus,
      userId,
    });

    if (newStatus === "delivered") {
      // ← use newStatus, not order.status (more predictable)
      await creditVendorWallet(order, session);
    }

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getOrderTracking = async (orderId: string, userId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).select("status shipment orderEvents");
  if (!order) throw new Error("Order not found");
  return order;
};

export const creditVendorWallet = async (
  order: IOrder,
  session: ClientSession,
) => {
  const commissionRate = Number(process.env.PLATFORM_COMMISSION || 0.1);
  const vendorTotals = calculateVendorTotals(order);
  for (const [vendorId, vendorGross] of vendorTotals.entries()) {
    const commissionAmount = vendorGross * commissionRate;
    const vendorEarning = vendorGross - commissionAmount;
    // 1️⃣ Credit vendor wallet
    await VendorWallet.updateOne(
      { vendor: vendorId },
      {
        $inc: {
          balance: vendorEarning,
          totalEarned: vendorEarning,
        },
      },
      { upsert: true, session },
    );

    // 2️⃣ Store commission record (ledger)
    await Commission.create(
      [
        {
          vendor: vendorId,
          order: order._id,
          orderAmount: vendorGross,
          commissionAmount,
          commissionRate,
          vendorEarning,
          status: "pending", // useful for refunds later
        },
      ],
      { session },
    );
  }
};

function calculateVendorTotals(order: IOrder) {
  const map = new Map<string, number>();
  for (const item of order.items) {
    const vendorId = item.vendor.toString();
    map.set(vendorId, (map.get(vendorId) ?? 0) + item.subtotal);
  }

  return map;
}

//rerund hanldling logic
// await VendorWallet.updateOne(
//   { vendor: order.vendor },
//   { $inc: { balance: -vendorEarning } }
// );

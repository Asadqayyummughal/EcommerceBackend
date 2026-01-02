import Cart from "../models/cart.model";
import Product from "../models/product.model";
import Order, { OrderStatus } from "../models/order.model";
import mongoose from "mongoose";
import { restoreInventory } from "./inventory.service";

import { AuthUser } from "../types/express";
import { refundStripePayment } from "./refund-stripe.service";
export const checkoutOreder = async (
  userId: string,
  payload: {
    paymentMethod: "cod" | "stripe" | "paypal";
    shippingAddress: any;
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
    const totalAmount = subtotal + tax + shipping;

    const order = await Order.create(
      //create order
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
        },
      ],
      { session }
    );

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
      let refundRes = await refundStripePayment(order.stripePaymentIntentId);
      console.log("refundRes==>", refundRes);
      debugger;

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
  newStatus: OrderStatus
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");

    // 🚫 Prevent invalid transitions
    if (order.status === "shipped" || order.status === "delivered") {
      throw new Error("Order cannot be modified");
    }

    // 🔁 Restore stock ONLY if transitioning to a failure state
    const restoreStates = ["cancelled", "failed", "expired"];

    if (
      restoreStates.includes(newStatus) &&
      !restoreStates.includes(order.status)
    ) {
      await restoreInventory(order, session);
    }

    order.status = newStatus;
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

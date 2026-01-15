import mongoose, { ClientSession } from "mongoose";
import Order from "../models/order.model";
import { Return } from "../models/return.model";
import Product from "../models/product.model";

export const createReturnRequest = async (
  userId: string,
  payload: {
    orderId: string;
    items: any[];
  }
) => {
  const order = await Order.findOne({
    _id: payload.orderId,
    user: userId,
    status: "delivered",
  });

  if (!order) throw new Error("Order not eligible for return");
  // ⏱ Return window (example: 7 days)
  const deliveredAt = order.updatedAt;
  const daysPassed =
    (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysPassed > 7) throw new Error("Return window expired");
  return Return.create({
    order: order._id,
    user: userId,
    items: payload.items,
  });
};

export const approveReturn = async (returnId: string) => {
  const rma = await Return.findById(returnId);
  if (!rma) throw new Error("Return not found");
  if (rma.status !== "requested") throw new Error("Invalid return state");
  rma.status = "approved";
  await rma.save();

  return rma;
};

export const rejectReturn = async (returnId: string, adminNote: string) => {
  const rma = await Return.findById(returnId);
  if (!rma) throw new Error("Return not found");
  rma.status = "rejected";
  rma.adminNote = adminNote;
  await rma.save();
  // eventBus.emit("return.rejected", rma);

  return rma;
};

export const getAllReturns = async () => {
  return Return.find().populate("user order").sort({ createdAt: -1 });
};

//amdin will mark return received
export const markReturnReceived = async (returnId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rma = await Return.findById(returnId).session(session);
    if (!rma) throw new Error("Return not found");
    if (rma.status !== "approved") throw new Error("Return not approved");
    rma.status = "received";
    await restoreInventoryFromReturn(rma, session);
    await rma.save({ session });
    await session.commitTransaction();
    // eventBus.emit("return.received", rma);
    return rma;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};

export const refundReturn = async (
  returnId: string,
  refundMethod: "original" | "wallet"
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log(
    "refund get called==============================================>",
    returnId,
    refundMethod
  );

  debugger;
  try {
    const rma = await Return.findById(returnId)
      .populate("order")
      .session(session);
    if (!rma) throw new Error("Return not found");
    if (rma.status !== "received") throw new Error("Items not received");
    const refundAmount = calculateReturnRefund(rma);
    // Stripe / Wallet logic here
    rma.refundAmount = refundAmount;
    rma.refundMethod = refundMethod;
    rma.status = "refunded";
    await rma.save({ session });
    await session.commitTransaction();

    // eventBus.emit("return.refunded", rma);
    return rma;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};

export const restoreInventoryFromReturn = async (
  rma: any,
  session: ClientSession
) => {
  const order = await Order.findById(rma.order).session(session);
  for (const item of rma.items) {
    if (item.condition !== "new") continue;
    const product = await Product.findById(item.product).session(session);
    if (!product) continue;
    if (order) {
      if (item.variantSku) {
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (!variant) continue;
        if (order.paymentStatus === "paid") {
          variant.stock += item.quantity;
        } else {
          variant.reservedStock += item.quantity;
        }
      } else {
        if (order.paymentStatus === "paid") {
          product.stock += item.quantity;
        } else {
          product.reservedStock += item.quantity;
        }
      }
    }

    await product.save({ session });
  }
};

export const calculateReturnRefund = (rma: any) => {
  const order = rma.order;
  let refundableSubtotal = 0;
  // 1️⃣ Calculate subtotal of returned items
  for (const returnItem of rma.items) {
    if (returnItem.condition !== "new") continue;
    const orderItem = order.items.find(
      (i: any) =>
        i.product.toString() === returnItem.product.toString() &&
        i.variantSku === returnItem.variantSku
    );
    if (!orderItem) continue;
    refundableSubtotal += orderItem.price * returnItem.quantity;
  }
  if (refundableSubtotal === 0) return 0;
  // 2️⃣ Proportional tax refund
  const taxRatio = refundableSubtotal / order.subtotal;
  const refundableTax = order.tax * taxRatio;
  // 3️⃣ Coupon discount reapportion
  let couponRefund = 0;
  if (order.coupon?.discountAmount) {
    const couponRatio = refundableSubtotal / order.subtotal;

    couponRefund = order.coupon.discountAmount * couponRatio;
  }

  // 4️⃣ Shipping refund (ONLY if full return)
  const returnedQty = rma.items.reduce(
    (sum: number, i: any) => sum + i.quantity,
    0
  );

  const orderedQty = order.items.reduce(
    (sum: number, i: any) => sum + i.quantity,
    0
  );

  const refundShipping = returnedQty === orderedQty ? order.shipping : 0;

  // 5️⃣ Final refund
  const refundAmount =
    refundableSubtotal + refundableTax + refundShipping - couponRefund;

  // 6️⃣ Safety guard
  return Math.max(0, Number(refundAmount.toFixed(2)));
};

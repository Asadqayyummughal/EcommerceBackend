import Cart from "../models/cart.model";
import Product from "../models/product.model";
import Order from "../models/order.model";
import mongoose from "mongoose";
export const checkoutService = async (
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
        console.log("check varient ", variant);

        if (variant && variant.stock && variant.stock > item.quantity) {
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

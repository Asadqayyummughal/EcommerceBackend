import mongoose from "mongoose";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import { calculateCartTotals } from "../utils/cart.utils";

interface SyncItem {
  productId: string;
  variantSku?: string;
  quantity: number;
}

export const getCartService = async (userId: string) => {
  return await Cart.findOne({ user: userId }).populate("items.product");
};

export const addToCartService = async (
  userId: string,
  productId: string,
  quantity: number,
  variantSku?: string
) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new Error("Product not available");
  }
  let price = product.salePrice ?? product.price;
  if (variantSku) {
    const variant = product.variants?.find((v) => v.sku === variantSku);
    if (!variant) throw new Error("Variant not found");
    price = variant.price ?? price;
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existingItem = cart.items.find(
    (i) => i.product.toString() === productId && i.variantSku === variantSku
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId as any, quantity, price, variantSku });
  }

  const totals = calculateCartTotals(cart.items);
  cart.totalItems = totals.totalItems;
  cart.totalPrice = totals.totalPrice;

  await cart.save();
  return cart;
};

export const updateCartItemService = async (
  userId: string,
  productId: string,
  quantity: number,
  variantSku?: string
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");
  const item = cart.items.find(
    (i) => i.product.toString() === productId && i.variantSku === variantSku
  );
  if (!item) throw new Error("Item not found in cart");
  item.quantity = quantity;
  cart.set(calculateCartTotals(cart.items));
  await cart.save();
  return cart;
};

export const removeCartItemService = async (
  userId: string,
  productId: string,
  variantSku?: string
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (i) => !(i.product.toString() === productId && i.variantSku === variantSku)
  );

  cart.set(calculateCartTotals(cart.items));
  await cart.save();
  return cart;
};

export const clearCartService = async (userId: string) => {
  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], totalItems: 0, totalPrice: 0 }
  );
};

export const syncCartService = async (
  userId: string,
  guestItems: SyncItem[]
) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  }

  // 🔥 Fetch all products in ONE query
  const productIds = guestItems.map((i) => i.productId);

  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // 🔥 Build cart map for fast lookup
  const cartMap = new Map(
    cart.items.map((item) => [
      `${item.product.toString()}-${item.variantSku ?? ""}`,
      item,
    ])
  );

  for (const guestItem of guestItems) {
    const product = productMap.get(guestItem.productId);
    if (!product) continue;

    let price = product.salePrice ?? product.price;

    // Variant handling
    if (guestItem.variantSku) {
      const variant = product.variants?.find(
        (v) => v.sku === guestItem.variantSku
      );
      if (variant?.price) price = variant.price;
    }

    const key = `${guestItem.productId}-${guestItem.variantSku ?? ""}`;

    const existingItem = cartMap.get(key);

    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
      existingItem.price = price;
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(guestItem.productId),
        variantSku: guestItem.variantSku,
        quantity: guestItem.quantity,
        price,
      });
    }
  }

  // 🔥 Recalculate totals
  cart.totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  cart.totalPrice = cart.items.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0
  );

  await cart.save();
  return cart;
};

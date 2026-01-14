import { ClientSession } from "mongoose";
import Product from "../models/product.model";
import { IOrder } from "../models/order.model";

export const restoreInventory = async (
  order: IOrder,
  session: ClientSession
) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product).session(session);
    if (!product) continue;

    if (item.variantSku) {
      const variant = product.variants?.find((v) => v.sku === item.variantSku);
      if (variant && variant.stock) {
        variant.reservedStock -= item.quantity;
      }
    } else {
      product.reservedStock -= item.quantity;
    }

    await product.save({ session });
  }
};

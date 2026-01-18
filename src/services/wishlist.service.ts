import Product from "../models/product.model";
import Wishlist, { IWishlist } from "../models/wishlist.model";

export const toggleWishlistItem = async (userId: string, productId: string) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId],
    });
    return wishlist;
  }
  const exists = wishlist.products.some((p) => p.toString() === productId);

  if (exists) {
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
  } else {
    wishlist.products.push(productId);
  }

  await wishlist.save();
  return wishlist;
};

import { Types } from "mongoose";
import Wishlist from "../models/wishlist.model";

export const toggleWishlistItem = async (userId: string, productId: string) => {
  // Optional: convert strings → ObjectId (very common pattern)
  const uid = new Types.ObjectId(userId);
  const pid = new Types.ObjectId(productId);

  let wishlist = await Wishlist.findOne({ user: uid });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: uid,
      products: [pid],
    });
    return wishlist;
  }

  const exists = wishlist.products.some((p) => p.equals(pid)); // ← better than .toString()

  if (exists) {
    wishlist.products = wishlist.products.filter((p) => !p.equals(pid));
  } else {
    wishlist.products.push(pid);
  }

  await wishlist.save();
  return wishlist;
};

//get wish list

export const getWishlist = async (
  userId: string,
  page: number,
  limit: number
) => {
  const wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "products",
    select: "name price images averageRating",
  });

  if (!wishlist) {
    return {
      success: true,
      data: [],
      count: 0,
    };
  }
  const start = (page - 1) * limit;
  const end = start + limit;
  const products = wishlist.products.slice(start, end);
  return {
    success: true,
    data: products,
    count: wishlist.products.length,
  };
};

//delet wishlist
export const deleteWishlist = async (userId: string, productId: string) => {
  return await Wishlist.updateOne(
    { user: userId },
    { $pull: { products: productId } }
  );
};

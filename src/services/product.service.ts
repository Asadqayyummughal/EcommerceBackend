import mongoose from "mongoose";
import Product, { IProduct } from "../models/product.model";

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  q?: string; // search query
  minPrice?: number;
  maxPrice?: number;
  categories?: string[]; // array of category ids
  tags?: string[];
  sort?: string; // e.g. "price:asc" or "createdAt:desc"
  isActive?: boolean;
}
export const createProductService = async (payload: Partial<IProduct>) => {
  const product = await Product.create(payload);
  return product.toObject();
};

export const getProductByIdService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product id");
  const product = await Product.findById(id).lean();
  if (!product) throw new Error("Product not found");
  return product;
};

export const listProductsService = async (opts: ProductQueryOptions) => {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, opts.limit ?? 20);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (opts.isActive !== undefined) filter.isActive = opts.isActive;
  if (opts.minPrice !== undefined || opts.maxPrice !== undefined) {
    filter.price = {};
    if (opts.minPrice !== undefined) filter.price.$gte = opts.minPrice;
    if (opts.maxPrice !== undefined) filter.price.$lte = opts.maxPrice;
  }
  if (opts.categories && opts.categories.length) {
    filter.categories = { $in: opts.categories };
  }
  if (opts.tags && opts.tags.length) {
    filter.tags = { $in: opts.tags };
  }

  let sort: any = { createdAt: -1 };
  if (opts.sort) {
    const [key, dir] = opts.sort.split(":");
    sort = { [key]: dir === "asc" ? 1 : -1 };
  }

  if (opts.q) {
    filter.$text = { $search: opts.q };
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
export const updateProductService = async (
  id: string,
  payload: Partial<IProduct>
) => {
  const product = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!product) throw new Error("Product not found");
  return product.toObject();
};

export const deleteProductService = async (id: string) => {
  const p = await Product.findByIdAndDelete(id);
  if (!p) throw new Error("Product not found");
  return true;
};

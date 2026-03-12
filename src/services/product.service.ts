import mongoose from "mongoose";
import Product, { IProduct } from "../models/product.model";
import SubCategory from "../models/subcategory.model";
import { Store } from "../models/store.model";
import { Vendor } from "../models/vendor.model";
import { AppError } from "../utils/AppError";

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  subCategory?: string;
  tags?: string[];
  sort?: string; // e.g. "price:asc" or "createdAt:desc"
  isActive?: boolean;
}

const validateSubCategory = async (
  categoryId: string,
  subCategoryId: string,
) => {
  const sub = await SubCategory.findById(subCategoryId);
  if (!sub) throw new AppError("SubCategory not found", 404);
  if (sub.category.toString() !== categoryId.toString()) {
    throw new AppError("SubCategory does not belong to the given Category", 400);
  }
};

export const createProductService = async (payload: Partial<IProduct>) => {
  const vendor = await Vendor.findOne({
    user: payload.createdBy,
    status: "active",
  });
  if (!vendor) throw new AppError("Vendor not found", 404);
  const store = await Store.findOne({
    vendor: vendor?._id,
    status: "approved",
  });
  if (!store) throw new AppError("Store not approved", 403);

  if (payload.subCategory && payload.category) {
    await validateSubCategory(
      payload.category.toString(),
      payload.subCategory.toString(),
    );
  }

  const product = await Product.create({
    ...payload,
    vendor: vendor._id,
    store: store._id,
  });
  return product.toObject();
};

export const getProductByIdService = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("Invalid product id", 400);
  const product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("subCategory", "name slug")
    .lean();
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

export const listProductsService = async (opts: ProductQueryOptions) => {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, opts.limit ?? 20);
  const skip = (page - 1) * limit;

  const filter: any = { isActive: true };

  if (opts.isActive !== undefined) filter.isActive = opts.isActive;
  if (opts.minPrice !== undefined || opts.maxPrice !== undefined) {
    filter.price = {};
    if (opts.minPrice !== undefined) filter.price.$gte = opts.minPrice;
    if (opts.maxPrice !== undefined) filter.price.$lte = opts.maxPrice;
  }
  if (opts.category) {
    filter.category = opts.category;
  }
  if (opts.subCategory) {
    // Include products in this subCategory AND any of its descendants
    const descendants = await SubCategory.find(
      { ancestors: opts.subCategory },
      "_id",
    ).lean();
    const subCategoryIds = [
      opts.subCategory,
      ...descendants.map((d) => d._id.toString()),
    ];
    filter.subCategory = { $in: subCategoryIds };
  }
  if (opts.tags && opts.tags.length) {
    filter.tags = { $in: opts.tags };
  }
  if (opts.q) {
    filter.$text = { $search: opts.q };
  }

  let sort: any = { createdAt: -1 };
  if (opts.sort) {
    const [key, dir] = opts.sort.split(":");
    sort = { [key]: dir === "asc" ? 1 : -1 };
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("vendor", "storeName")
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
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
  payload: Partial<IProduct>,
) => {
  if (payload.subCategory && payload.category) {
    await validateSubCategory(
      payload.category.toString(),
      payload.subCategory.toString(),
    );
  } else if (payload.subCategory && !payload.category) {
    // subCategory is being updated but category is not — fetch current category from DB
    const existing = await Product.findById(id).select("category").lean();
    if (!existing) throw new AppError("Product not found", 404);
    await validateSubCategory(
      existing.category.toString(),
      payload.subCategory.toString(),
    );
  }

  const product = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!product) throw new AppError("Product not found", 404);
  return product.toObject();
};

export const deleteProductService = async (id: string) => {
  const p = await Product.findByIdAndDelete(id);
  if (!p) throw new AppError("Product not found", 404);
  return true;
};

export const getVendorStoreProducts = async (vendorId: string) => {
  let store = await Store.findOne({ vendor: vendorId });
  if (!store) throw new AppError("Store does not exist", 404);
  return await Product.find({
    store: store._id,
    isActive: true,
  });
};

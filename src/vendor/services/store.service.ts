import slugify from "slugify";
import { IStore, Store, STORE_STATUS_TYPE } from "../../models/store.model";
import { Vendor } from "../../models/vendor.model";
import Order from "../../models/order.model";
import mongoose from "mongoose";
import Product from "../../models/product.model";
import { toObjectId } from "../../utils/helpers.utils";

export const createStore = async (userId: string, body: IStore) => {
  const { name, description } = body;
  // 1️⃣ Vendor must exist & be approved
  const vendor = await Vendor.findOne({
    user: userId,
    status: "active",
  });
  if (!vendor) {
    throw new Error("Vendor account not approved");
  }
  // 2️⃣ One store per vendor
  const existingStore = await Store.findOne({ vendor: vendor._id });
  if (existingStore) {
    throw new Error("Store already exists");
  }
  // 3️⃣ Generate slug
  let baseSlug = slugify(name, {
    lower: true,
    strict: true,
  });
  let slug = baseSlug;
  let count = 1;
  // Ensure slug uniqueness
  while (await Store.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }
  // 4️⃣ Create store
  return await Store.create({
    vendor: vendor._id,
    name,
    slug,
    description,
  });
};

export const approveStore = async (
  storeId: string,
  status: STORE_STATUS_TYPE,
) => {
  const store = await Store.findById({ _id: storeId });
  if (!store) throw new Error("Store doesn't exists");
  store.status = status;
  return await store.save();
};
export const listAllStores = async () => {
  return await Store.find();
};

export const getStoreByUserId = async (userId: string) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new Error("Vendor not found for this user");
  }
  const store = await Store.findOne({ vendor: vendor._id });
  if (!store) {
    throw new Error("Store not found or does not belong to you");
  }

  return store;
};

export const updateStore = async (
  userId: string,
  storeId: string,
  updateData: Partial<IStore>, // better than passing whole IStore
) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new Error("Vendor not found for this user");
  }
  const store = await Store.findOne({ _id: storeId, vendor: vendor._id });
  if (!store) {
    throw new Error("Store not found or does not belong to you");
  }
  // 3. Add updatedBy
  updateData.updatedBy = vendor.user;
  const updated = await Store.findByIdAndUpdate(
    storeId,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  return updated;
};

export const getStoreAnalytics = async (vendorId: string) => {
  const vendorObjectId = toObjectId(vendorId);
  const stats = await Order.aggregate([
    { $match: { "items.vendor": vendorObjectId } },
    { $unwind: "$items" },
    { $match: { "items.vendor": vendorObjectId } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$items.subtotal" },
        totalOrders: { $addToSet: "$_id" }, // unique orders
      },
    },
    {
      $project: {
        totalRevenue: 1,
        totalOrders: { $size: "$totalOrders" },
        avgOrderValue: {
          $cond: [
            { $eq: [{ $size: "$totalOrders" }, 0] },
            0,
            { $divide: ["$totalRevenue", { $size: "$totalOrders" }] },
          ],
        },
      },
    },
  ]);

  return stats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
};
export const listStoreProducts = async (storeId: string) => {
  const orders = await Product.find({ store: storeId });
  return orders;
};
export const getOrdersByVendorWithAggregation = async (vendorId: string) => {
  const orders = await Order.aggregate([
    {
      $match: {
        "items.vendor": new mongoose.Types.ObjectId(vendorId),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    // Optional: only keep items from this vendor
    {
      $set: {
        items: {
          $filter: {
            input: "$items",
            as: "item",
            cond: {
              $eq: ["$$item.vendor", new mongoose.Types.ObjectId(vendorId)],
            },
          },
        },
      },
    },
    // Optional: add computed fields
    {
      $addFields: {
        vendorTotal: { $sum: "$items.subtotal" },
      },
    },
  ]);

  return orders;
};

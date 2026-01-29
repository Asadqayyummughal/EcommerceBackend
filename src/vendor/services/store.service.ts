import { register } from "module";
import { IStore, Store } from "../../models/store.model";
import { IVendor, Vendor } from "../../models/vendor.model";

export const createStore = async (userId: string, body: IStore) => {
  const vendor = await Vendor.findOne({
    user: userId,
    status: "active",
  });
  if (!vendor) throw new Error("Vendor Doesn't exist or not approved");
  const existingStore = await Store.findOne({ vendor: vendor?._id });
  if (existingStore) throw new Error("Store already exists");
  const store = await Store.create({
    vendor: vendor?._id,
    name: body.name,
    // slug: slugify(req.body.name)
  });
  return store;
};
export const approveStore = async (storeId: string, status: string) => {
  const store = await Store.find({ _id: storeId });
  if (!store) throw new Error("Store doesn't exists");
  store.status = status;
  return await store.save();
};

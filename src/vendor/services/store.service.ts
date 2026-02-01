import slugify from "slugify";
import { IStore, Store, STORE_STATUS_TYPE } from "../../models/store.model";
import { Vendor } from "../../models/vendor.model";

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

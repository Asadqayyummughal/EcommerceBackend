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
export const listAllStores = async () => {
  return await Store.find();
};

export const updateStore = async (
  userId: string,
  storeId: string,
  updateData: Partial<IStore>, // better than passing whole IStore
) => {
  // 1. Find vendor (you can optimize this query later)
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new Error("Vendor not found for this user");
  }

  // 2. Verify store exists + belongs to this vendor
  const store = await Store.findOne({ _id: storeId, vendor: vendor._id });
  if (!store) {
    throw new Error("Store not found or does not belong to you");
  }

  // 3. Add updatedBy
  updateData.updatedBy = vendor.user; // assuming vendor.user is ObjectId of User

  // Optional: protect some fields from direct update
  // delete updateData.status;           // if only admin can change status
  // delete updateData.vendor;

  // 4. Update (use Partial + $set internally)
  const updated = await Store.findByIdAndUpdate(
    storeId,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  return updated;
};

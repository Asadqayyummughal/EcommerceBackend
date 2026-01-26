import { Vendor } from "../models/vendor.model";
import User from "../models/user.model";
export const applyVendor = async (userId: string) => {
  let user = await User.findById(userId);
  const existing = await Vendor.findOne({ user: userId });
  if (existing) {
    throw new Error("Vendor already exists");
  }
  if (user) {
    const vendor = await Vendor.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    return vendor;
  }
};

export const getVendorsByStatus = async (status: string) => {
  const vendors = await Vendor.find({ status: status });
  return vendors;
};

export const approveVendor = async (vendorId: string) => {
  const isExist = await Vendor.findOne({ _id: vendorId });
  if (!isExist) throw Error("Vendor Does not exist");
};

import { Vendor } from "../models/vendor.model";
import User from "../models/user.model";
export const applyVendor = async (userId: string) => {
  const existing = await Vendor.findOne({ user: userId });
  let user = await User.findById(userId);
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

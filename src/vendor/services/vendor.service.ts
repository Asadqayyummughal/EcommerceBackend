import { Vendor } from "../../models/vendor.model";
import User from "../../models/user.model";
import Role from "../../models/role.model";
import Order from "../../models/order.model";
import { VendorWallet } from "../../models/vendorWallet.model";
export const applyForVendor = async (userId: string) => {
  //check here if venore role exist or not
  let user = await User.findById(userId); //69809c2a09c9a53278e149f5
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

export const approveVendor = async (vendorId: string, userId: string) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new Error("Vendor Does not exist");
  const vendorRole = await Role.findOne({ name: "vendor" });
  if (!vendorRole) throw new Error("Vendor role not configured");
  vendor.status = "active";
  vendor.approvedAt = new Date();
  vendor.approvedBy = userId;
  await vendor.save();
  let user = await User.updateOne(
    { _id: vendor.user },
    { role: vendorRole._id },
  );
  const existingWallet = await VendorWallet.findOne({ vendor: vendor._id });
  if (!existingWallet) {
    await VendorWallet.create([
      {
        vendor: vendor._id,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
      },
    ]);
  }

  return { user, vendor };
};

export const vedorAnalytics = async (storeId: string) => {
  const orders = await Order.find({ store: storeId });
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  return {
    totalOrders: orders.length,
    totalRevenue,
    avgOrderValue: totalRevenue / orders.length,
  };
};

export const topProductsAnlaytics = async () => {
  //   $unwind: "$items"
  // $group: {
  //   _id: "$items.product",
  //   totalSold: { $sum: "$items.quantity" },
  //   revenue: { $sum: "$items.subtotal" }
  // }
};

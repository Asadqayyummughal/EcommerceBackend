import Product from "../../models/product.model";
import { Vendor } from "../../models/vendor.model";

export const createVendorProduct = async (req, res) => {
  const vendor = await Vendor.findOne({
    user: req.user._id,
    status: "active",
  });

  if (!vendor) throw new Error("Vendor not approved");

  const product = await Product.create({
    ...req.body,
    vendor: vendor._id,
    createdBy: req.user._id,
  });

  res.status(201).json(product);
};

export const getVendorProducts = async (userId: string) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new Error("Vendor not found");
  const products = await Product.find({ vendor: vendor._id });
  return products;
};

export const updateVendorProduct = async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });

  const product = await Product.findOne({
    _id: req.params.id,
    vendor: vendor._id,
  });

  if (!product) {
    throw new Error("Product not found or access denied");
  }

  Object.assign(product, req.body);
  await product.save();

  res.json(product);
};

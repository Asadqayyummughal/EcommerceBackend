import Product, { IProduct } from "../../models/product.model";
import { Vendor } from "../../models/vendor.model";
import { AppError } from "../../utils/AppError";

export const createVendorProduct = async (
  userId: string,
  body: Partial<IProduct>,
) => {
  const vendor = await Vendor.findOne({
    user: userId,
    status: "active",
  });
  if (!vendor) throw new AppError("Vendor not approved", 403);
  const product = await Product.create({
    ...body,
    vendor: vendor._id,
    createdBy: userId,
  });
  return product;
};

export const getVendorProducts = async (userId: string) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new AppError("Vendor not found", 404);
  const products = await Product.find({ vendor: vendor._id });
  return products;
};

// export const updateVendorProduct = async (productId:string,userId:string,body:) => {
//   const vendor = await Vendor.findOne({ user: userId});
//   const product = await Product.findOne({
//     _id: productId,
//     vendor: vendor._id,
//   });
//   if (!product) {
//     throw new AppError("Product not found or access denied", 404);
//   }

//   Object.assign(product, req.body);
//   await product.save();

//   res.json(product);
// };

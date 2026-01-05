import Order from "../../models/order.model";
import Product from "../../models/product.model";

export const salesOverview = async () => {
  const result = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);

  return result[0] || { revenue: 0, orders: 0, avgOrderValue: 0 };
};

export const ordersByStatus = async () => {
  return Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

// top selling product
export const topSellingProducts = async () => {
  return Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        soldQty: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { soldQty: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ]);
};

// low stock alert
export const lowStockProducts = async () => {
  return Product.find({
    stock: { $lte: 5 },
    isActive: true,
  }).select("title stock");
};

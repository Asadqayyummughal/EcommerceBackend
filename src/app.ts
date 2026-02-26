import express, { Application } from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import subcategoryRoutes from "./routes/subcategory.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import webhookRoutes from "./routes/webhook.routes";
import dashboardRoutes from "./admin/routes/dashboard.routes";
import couponRoutes from "./admin/routes/coupon.routes";
import shipmentRoutes from "./admin/routes/shipment.routes";
import returnRoutes from "./routes/return.routes";
import reviewRoutes from "./routes/review.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import permissionRoutes from "./admin/routes/permission.routes";
import rolesRoutes from "./admin/routes/role.routes";
import adminUsersRoutes from "./admin/routes/users.routes";
import vendorRoutes from "./vendor/routes/vendor.routes";
import vendorProductRoutes from "./vendor/routes/vendor-product.routes";
import vendorStoreRoutes from "./vendor/routes/store.routes";
import notificatonRoutes from "./admin/routes/notification.routes";
const app: Application = express();
// webhook routes
app.use("/api/webhook", webhookRoutes);
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

//events.
import "../src/events/listeners";

app.get("/", (req, res) => {
  res.send("API running...");
});
// admin only apis
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/coupon", couponRoutes);
app.use("/api/admin/shipment", shipmentRoutes);
app.use("/api/admin/permissions", permissionRoutes);
app.use("/api/admin/roles", rolesRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/notification", notificatonRoutes);
// IMPORTANT: userRoutes MUST be a Router(), not an object!
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product/categories", categoryRoutes);
app.use("/api/product/subcategories", subcategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment/stripe", paymentRoutes);
app.use("/api/return", returnRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/vendor/products", vendorProductRoutes);
app.use("/api/vendor/store", vendorStoreRoutes);

export default app;

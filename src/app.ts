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

const app: Application = express();
// webhook routes
app.use("/api/webhook", webhookRoutes);
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

//events
import "../src/events/listeners";

app.get("/", (req, res) => {
  res.send("API running...");
});
// amdin only apis
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/coupon", couponRoutes);

// IMPORTANT: userRoutes MUST be a Router(), not an object!
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product/categories", categoryRoutes);
app.use("/api/product/subcategories", subcategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment/stripe", paymentRoutes);

export default app;

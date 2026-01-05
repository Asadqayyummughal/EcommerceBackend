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
const app: Application = express();
// webhook routes
app.use("/api/webhook", webhookRoutes);
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API running...");
});

// IMPORTANT: userRoutes MUST be a Router(), not an object!
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product/categories", categoryRoutes);
app.use("/api/product/subcategories", subcategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin", dashboardRoutes);

export default app;

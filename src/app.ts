import express, { Application } from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import subcategoryRoutes from "./routes/subcategory.routes";
import cartRoutes from "./routes/cart.routes";

const app: Application = express();

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
app.use("/api/product/cart", cartRoutes);

export default app;

import express, { Application } from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middlewares/auth.middleware.";

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

export default app;

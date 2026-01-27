import { Router } from "express";
import { requirePermission } from "../../middlewares/requirePermisson.middleware";
const router = Router();
router.post("/api/vendor/products", requirePermission("product:create")); //requireVendorApproved
router.get("/api/vendor/products");
router.put("api/vendor/products/:id");

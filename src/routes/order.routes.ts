import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();
router.post("/checkout", authMiddleware, orderController.checkout);
// User
router.get("/", authMiddleware, orderController.getMyOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);
router.put("/:id/cancel", authMiddleware, orderController.cancelOrder);
router.get("/:id/tracking", authMiddleware, orderController.getMyOrders);

// Admin
router.put(
  "/:id/status",
  authMiddleware,
  // isAdmin,
  // roleMiddleware,
  orderController.updateOrderStatus,
);

export default router;

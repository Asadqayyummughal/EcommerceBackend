import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

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
  //   roleMiddleware(["admin"]),
  orderController.updateOrderStatus
);
router.post(
  "/:id/ship",
  authMiddleware,
  //roleMiddleware(["admin"]),
  orderController.shipOrder
);
router.post(
  "/:id/deliver",
  authMiddleware,
  //roleMiddleware(["admin"]),
  orderController.deliverOrder
);
export default router;

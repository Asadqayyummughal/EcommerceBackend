import { Router } from "express";
const router = Router();
import * as shipmentController from "../controollers/shipment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
router.post(
  "/",
  authMiddleware,
  //roleMiddleware(["admin"]),
  shipmentController.crateShipment
);

router.put(
  "/:id/ship",
  authMiddleware,
  //roleMiddleware(["admin"]),
  shipmentController.markShipmentShipped
);
router.put(
  "/:id/deliver",
  authMiddleware,
  //roleMiddleware(["admin"]),
  shipmentController.markShipmentDelivered
);
export default router;

import { Router } from "express";
import * as notificationController from "../controollers/notification.controller";
const router = Router();
router.post(
  "/sendGlobalNotifications",
  notificationController.broadcastNotification,
);
export default router;

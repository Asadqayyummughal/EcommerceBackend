import { Request, Response } from "express";
import * as notificationsService from "../services/notification.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const broadcastNotification = asyncHandler(async (req: Request, res: Response) => {
  const { title, message } = req.body;
  await notificationsService.sendGlobalNotification(title, message);
  res.json({ success: true, message: "Notification sent" });
});

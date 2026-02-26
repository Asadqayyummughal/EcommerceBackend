import { Request, Response } from "express";

import * as notificationsService from "../services/notification.service";
export const broadcastNotification = async (req: Request, res: Response) => {
  const { title, message } = req.body;
  console.log("here is title and message==================>", title, message);

  notificationsService.sendGlobalNotification(title, message);
};

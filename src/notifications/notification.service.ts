// notification.service.ts
import { getIO } from "../socket";
import { Notification, NotificationType } from "./notification.model";
// import {User} from ""

interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: string[]; // ['in_app', 'push', 'email']
}

// export class NotificationService {
//   static async sendToUser(input: SendNotificationInput) {
//     const {
//       userId,
//       type,
//       title,
//       message,
//       data = {},
//       channels = ["in_app"],
//     } = input;

//     // 1. Save to DB (persistent + badge count + history)
//     const notification = await Notification.create({
//       user: userId,
//       type,
//       title,
//       message,
//       data,
//       channel: channels.includes("in_app") ? "in_app" : "push",
//     });

//     // 2. Real-time (if user is online)
//     if (channels.includes("in_app")) {
//       const io = getIO();
//       io.to(userId.toString()).emit("notification", {
//         _id: notification._id,
//         type,
//         title,
//         message,
//         data,
//         createdAt: notification.createdAt,
//         read: false,
//       });
//     }

//     // 3. Push / Email / SMS (async – fire & forget or queue)
//     if (channels.includes("push")) {
//       // await sendPushNotification(userId, title, message, data);
//     }

//     if (channels.includes("email")) {
//       // await sendEmail(user.email, title, message);
//     }

//     return notification;
//   }

//   static async sendGlobal(
//     type: NotificationType,
//     title: string,
//     message: string,
//     data?: any,
//   ) {
//     // For admin announcements → save once + broadcast
//     const io = getIO();
//     io.emit("global-notification", { type, title, message, data }); // or io.to("global")
//   }

//   // Admin broadcast to vendors only
//   static async sendToAllVendors(title: string, message: string, data?: any) {
//     // Option A: loop over online vendors (small scale)
//     // Option B: mark as global + filter on client (if role=vendor)
//     // Option C: have a "vendors" room
//   }
// }

export const createNotification = async (data: any) => {
  const notif = await Notification.create(data);

  const io = getIO();

  if (data.user) io.to(data.user.toString()).emit("notification", notif);
  else if (data.role && data.role !== "all")
    io.to(data.role).emit("notification", notif);
  else io.to("global").emit("notification", notif);

  return notif;
};

// {
//   "user": "USER_ID",
//   "role": "user",//vendor,
//   "title": "Order Shipped",
//   "message": "Your order ORD123 shipped",
//   "type": "order",
//   "entityId": "ORDER_ID",
//   "entityType": "order"
// }

// {
//   "user": "null",
//   "role": "user",//all
//   "title": "Order Shipped",
//   "message": "Your order ORD123 shipped",
//   "type": "order",
//   "entityId": "ORDER_ID",
//   "entityType": "order"
// }

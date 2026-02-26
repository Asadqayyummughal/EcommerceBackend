import { getIO } from "../../socket";

export const sendGlobalNotification = (title: string, message: string) => {
  //       await Notification.create({
  //     user: null,
  //     title,
  //     message,
  //     type: "global",
  //   });
  const io = getIO();
  io.to("global").emit("notification", { title, message });
};

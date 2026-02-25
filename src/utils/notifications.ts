import { getIO } from "../socket";

export const sendRealtimeNotification = async (userId: string, payload: {}) => {
  const io = getIO();
  io.to(userId.toString()).emit("notification", payload);
};
export const sendGlobalNotification = async (payload: object) => {
  const io = getIO();

  // Method A - most readable
  io.emit("notification", payload);

  // Method B - equivalent (older style)
  // io.sockets.emit("notification", payload);
};
await sendGlobalNotification({
  type: "system",
  title: "Maintenance completed",
  message: "The system is now fully operational 🚀",
  timestamp: new Date().toISOString(),
});

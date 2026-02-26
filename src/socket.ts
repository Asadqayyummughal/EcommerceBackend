import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    socket.join("global");
    socket.on("join", (userId) => {
      console.log("wohoo user has been connected", userId);
      socket.join(userId); // join user room
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

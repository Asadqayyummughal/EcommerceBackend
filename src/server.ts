import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/db";
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
import { initSocket } from "./socket";
(async () => {
  try {
    await connectDB();
    const httpServer = createServer(app);
    initSocket(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

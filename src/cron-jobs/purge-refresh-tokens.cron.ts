import cron from "node-cron";
import User from "../models/user.model";

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const result = await User.updateMany(
      { "refreshTokens.expiresAt": { $lt: now } },
      { $pull: { refreshTokens: { expiresAt: { $lt: now } } } },
    );
    console.log(`[Token Cleanup] Purged expired refresh tokens from ${result.modifiedCount} user(s)`);
  } catch (err) {
    console.error("[Token Cleanup] Failed to purge expired refresh tokens:", err);
  }
});

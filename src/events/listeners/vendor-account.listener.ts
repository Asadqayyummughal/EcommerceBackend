import User from "../../models/user.model";
import { sendEmail } from "../../services/email.service";
import { appEventEmitter } from "../appEvents";

appEventEmitter.on(
  "vendor.account.status",
  async ({ userId, stripeOnboarded, payoutsEnabled }) => {
    const user = await User.findById(userId);
    if (!user?.email) return;
    await sendEmail(
      user.email,
      `stripeOnboarded ${stripeOnboarded.toUpperCase()}`,
      `<p>Your account for payout is now <strong>${payoutsEnabled}</strong>.</p>`,
    );
  },
);

import { Affiliate } from "../../models/affiliate.model";
import { AffiliateConversion } from "../../models/affiliate-conversion.model";
import { AffiliatePayout } from "../../models/affiliate-payout.model";
import { AffiliateProgram } from "../../models/affiliate-program.model";
import { AppError } from "../../utils/AppError";

const TIER_DEFAULTS = [
  { name: "Bronze", minConversions: 0, commissionRate: 0.05 },
  { name: "Silver", minConversions: 10, commissionRate: 0.07 },
  { name: "Gold", minConversions: 50, commissionRate: 0.10 },
  { name: "Platinum", minConversions: 100, commissionRate: 0.15 },
];

/** Generate a unique readable affiliate code from user name */
const generateCode = async (name: string): Promise<string> => {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6)
    .padEnd(4, "X");

  let code: string;
  let attempts = 0;
  do {
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    code = `${base}${suffix}`;
    attempts++;
    if (attempts > 20) throw new AppError("Failed to generate unique code", 500);
  } while (await Affiliate.exists({ code }));

  return code;
};

/** Apply to become an affiliate */
export const applyForAffiliate = async (
  userId: string,
  userName: string,
  data: { website?: string; bio?: string },
) => {
  const existing = await Affiliate.findOne({ user: userId });
  if (existing) {
    if (existing.status === "rejected") {
      // Allow re-application after rejection
      existing.status = "pending";
      existing.website = data.website;
      existing.bio = data.bio;
      existing.rejectionReason = undefined;
      return existing.save();
    }
    throw new AppError("You have already applied for the affiliate program", 409);
  }

  const program = await AffiliateProgram.findOne();
  if (program && !program.isActive) {
    throw new AppError("Affiliate program is currently closed", 403);
  }

  const code = await generateCode(userName);
  const defaultRate = program?.defaultCommissionRate ?? 0.05;

  return Affiliate.create({
    user: userId,
    code,
    commissionRate: defaultRate,
    website: data.website,
    bio: data.bio,
  });
};

/** Get the affiliate profile for the logged-in user */
export const getMyAffiliate = async (userId: string) => {
  const affiliate = await Affiliate.findOne({ user: userId });
  if (!affiliate) throw new AppError("You are not an affiliate", 404);
  return affiliate;
};

/** Get full stats for an affiliate */
export const getAffiliateStats = async (userId: string) => {
  const affiliate = await Affiliate.findOne({ user: userId });
  if (!affiliate) throw new AppError("Not an affiliate", 404);

  const [conversionStats] = await AffiliateConversion.aggregate([
    { $match: { affiliate: affiliate._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalCommission: { $sum: "$commissionAmount" },
      },
    },
  ]);

  const conversions = await AffiliateConversion.aggregate([
    { $match: { affiliate: affiliate._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalCommission: { $sum: "$commissionAmount" },
      },
    },
  ]);

  return {
    affiliate,
    conversions,
  };
};

/** Get conversions for the logged-in affiliate (paginated) */
export const getMyConversions = async (
  userId: string,
  page = 1,
  limit = 20,
) => {
  const affiliate = await Affiliate.findOne({ user: userId });
  if (!affiliate) throw new AppError("Not an affiliate", 404);

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AffiliateConversion.find({ affiliate: affiliate._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("order", "totalAmount status createdAt"),
    AffiliateConversion.countDocuments({ affiliate: affiliate._id }),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
};

/** Request a payout */
export const requestPayout = async (
  userId: string,
  amount: number,
  method: "bank" | "paypal" | "stripe",
  payoutDetails: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    paypalEmail?: string;
  },
) => {
  const affiliate = await Affiliate.findOne({ user: userId, status: "active" });
  if (!affiliate) throw new AppError("Active affiliate account required", 403);

  const program = await AffiliateProgram.findOne();
  const minPayout = program?.minPayoutAmount ?? 50;

  if (amount < minPayout) {
    throw new AppError(`Minimum payout amount is $${minPayout}`, 400);
  }

  if (amount > affiliate.balance) {
    throw new AppError("Insufficient balance", 400);
  }

  // Deduct from balance and lock it
  affiliate.balance -= amount;
  affiliate.lockedBalance += amount;
  await affiliate.save();

  return AffiliatePayout.create({
    affiliate: affiliate._id,
    amount,
    method,
    payoutDetails,
    requestedAt: new Date(),
  });
};

/** Get payout history for the logged-in affiliate */
export const getMyPayouts = async (userId: string, page = 1, limit = 20) => {
  const affiliate = await Affiliate.findOne({ user: userId });
  if (!affiliate) throw new AppError("Not an affiliate", 404);

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AffiliatePayout.find({ affiliate: affiliate._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AffiliatePayout.countDocuments({ affiliate: affiliate._id }),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
};

/** Get or seed the affiliate program settings */
export const getProgram = async () => {
  let program = await AffiliateProgram.findOne();
  if (!program) {
    program = await AffiliateProgram.create({ tiers: TIER_DEFAULTS });
  }
  return program;
};

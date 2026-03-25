import { Affiliate } from "../../models/affiliate.model";
import { AffiliateConversion } from "../../models/affiliate-conversion.model";
import { AffiliatePayout } from "../../models/affiliate-payout.model";
import { AffiliateProgram, IAffiliateTierConfig } from "../../models/affiliate-program.model";
import { AppError } from "../../utils/AppError";

/** List all affiliates with optional status filter */
export const listAffiliates = async (
  status?: string,
  page = 1,
  limit = 20,
) => {
  const filter: Record<string, any> = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Affiliate.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email"),
    Affiliate.countDocuments(filter),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
};

/** Approve or reject an affiliate application */
export const updateAffiliateStatus = async (
  affiliateId: string,
  status: "active" | "rejected" | "suspended",
  adminId: string,
  rejectionReason?: string,
) => {
  const affiliate = await Affiliate.findById(affiliateId);
  if (!affiliate) throw new AppError("Affiliate not found", 404);

  affiliate.status = status;

  if (status === "active") {
    affiliate.approvedAt = new Date();
    affiliate.approvedBy = adminId as any;
    affiliate.rejectionReason = undefined;
  }

  if (status === "rejected" && rejectionReason) {
    affiliate.rejectionReason = rejectionReason;
  }

  return affiliate.save();
};

/** Get all conversions for an affiliate */
export const getAffiliateConversions = async (
  affiliateId: string,
  page = 1,
  limit = 20,
) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AffiliateConversion.find({ affiliate: affiliateId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("order", "totalAmount status createdAt")
      .populate("user", "name email"),
    AffiliateConversion.countDocuments({ affiliate: affiliateId }),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
};

/** List all payout requests */
export const listPayouts = async (status?: string, page = 1, limit = 20) => {
  const filter: Record<string, any> = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AffiliatePayout.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("affiliate", "user code balance"),
    AffiliatePayout.countDocuments(filter),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
};

/** Approve a payout request */
export const approvePayout = async (payoutId: string, adminNote?: string) => {
  const payout = await AffiliatePayout.findById(payoutId);
  if (!payout) throw new AppError("Payout not found", 404);
  if (payout.status !== "requested") {
    throw new AppError(`Cannot approve a payout with status "${payout.status}"`, 400);
  }

  payout.status = "approved";
  if (adminNote) payout.adminNote = adminNote;
  return payout.save();
};

/** Mark a payout as paid (after manual processing) */
export const markPayoutPaid = async (payoutId: string) => {
  const payout = await AffiliatePayout.findById(payoutId).populate<{
    affiliate: { _id: any; lockedBalance: number; totalPaidOut: number };
  }>("affiliate");

  if (!payout) throw new AppError("Payout not found", 404);
  if (payout.status !== "approved") {
    throw new AppError("Only approved payouts can be marked as paid", 400);
  }

  payout.status = "paid";
  payout.processedAt = new Date();
  await payout.save();

  await Affiliate.updateOne(
    { _id: payout.affiliate },
    {
      $inc: {
        lockedBalance: -payout.amount,
        totalPaidOut: payout.amount,
      },
    },
  );

  return payout;
};

/** Reject a payout — refund balance back to affiliate */
export const rejectPayout = async (payoutId: string, reason: string) => {
  const payout = await AffiliatePayout.findById(payoutId);
  if (!payout) throw new AppError("Payout not found", 404);
  if (!["requested", "approved"].includes(payout.status)) {
    throw new AppError("Payout cannot be rejected at this stage", 400);
  }

  payout.status = "rejected";
  payout.failureReason = reason;
  payout.processedAt = new Date();
  await payout.save();

  // Restore the locked balance back to available balance
  await Affiliate.updateOne(
    { _id: payout.affiliate },
    {
      $inc: {
        lockedBalance: -payout.amount,
        balance: payout.amount,
      },
    },
  );

  return payout;
};

/** Get program settings */
export const getProgramSettings = async () => {
  let program = await AffiliateProgram.findOne();
  if (!program) {
    program = await AffiliateProgram.create({
      tiers: [
        { name: "Bronze", minConversions: 0, commissionRate: 0.05 },
        { name: "Silver", minConversions: 10, commissionRate: 0.07 },
        { name: "Gold", minConversions: 50, commissionRate: 0.10 },
        { name: "Platinum", minConversions: 100, commissionRate: 0.15 },
      ],
    });
  }
  return program;
};

/** Update program settings */
export const updateProgramSettings = async (data: {
  isActive?: boolean;
  defaultCommissionRate?: number;
  cookieDurationDays?: number;
  minPayoutAmount?: number;
  conversionApprovalDays?: number;
  tiers?: IAffiliateTierConfig[];
}) => {
  const program = await AffiliateProgram.findOne();
  if (!program) throw new AppError("Program not initialized", 500);
  Object.assign(program, data);
  return program.save();
};

/** Platform affiliate analytics */
export const getAffiliateAnalytics = async () => {
  const [statusBreakdown, conversionStats, topAffiliates] = await Promise.all([
    Affiliate.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    AffiliateConversion.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalCommission: { $sum: "$commissionAmount" },
          totalOrderAmount: { $sum: "$orderAmount" },
        },
      },
    ]),
    Affiliate.find({ status: "active" })
      .sort({ totalEarned: -1 })
      .limit(10)
      .populate("user", "name email")
      .select("code tier totalEarned totalConversions totalClicks"),
  ]);

  return { statusBreakdown, conversionStats, topAffiliates };
};

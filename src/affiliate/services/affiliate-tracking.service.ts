import { Request } from "express";
import { Affiliate } from "../../models/affiliate.model";
import { AffiliateClick } from "../../models/affiliate-click.model";
import { AffiliateConversion } from "../../models/affiliate-conversion.model";
import { AffiliateProgram } from "../../models/affiliate-program.model";
import { AppError } from "../../utils/AppError";
import mongoose, { ClientSession } from "mongoose";

/**
 * Record a click on an affiliate link.
 * Returns the click document (used to link to conversion later).
 */
export const recordClick = async (
  code: string,
  req: Request,
  productId?: string,
) => {
  const affiliate = await Affiliate.findOne({ code: code.toUpperCase(), status: "active" });
  if (!affiliate) throw new AppError("Invalid or inactive affiliate link", 404);

  const click = await AffiliateClick.create({
    affiliate: affiliate._id,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    referrer: req.headers["referer"],
    productId: productId ? new mongoose.Types.ObjectId(productId) : undefined,
  });

  // Increment click counter (fire-and-forget, non-critical)
  Affiliate.updateOne({ _id: affiliate._id }, { $inc: { totalClicks: 1 } }).exec();

  return { affiliateId: affiliate._id, clickId: click._id, code: affiliate.code };
};

/**
 * Create a conversion when an order is paid.
 * Called from the Stripe webhook on payment_intent.succeeded.
 */
export const createConversion = async (
  orderId: string,
  userId: string,
  affiliateCode: string,
  orderAmount: number,
  session: ClientSession,
) => {
  const affiliate = await Affiliate.findOne({
    code: affiliateCode.toUpperCase(),
    status: "active",
  }).session(session);

  if (!affiliate) return; // Affiliate deactivated after order was placed — skip

  // Prevent self-referral
  if (affiliate.user.toString() === userId) return;

  // Avoid duplicate conversions (idempotency)
  const existing = await AffiliateConversion.findOne({ order: orderId }).session(session);
  if (existing) return;

  const commissionAmount = parseFloat((orderAmount * affiliate.commissionRate).toFixed(2));

  await AffiliateConversion.create(
    [
      {
        affiliate: affiliate._id,
        order: new mongoose.Types.ObjectId(orderId),
        user: new mongoose.Types.ObjectId(userId),
        orderAmount,
        commissionRate: affiliate.commissionRate,
        commissionAmount,
        status: "pending",
      },
    ],
    { session },
  );

  // Credit affiliate balance (pending — locked until order delivered)
  await Affiliate.updateOne(
    { _id: affiliate._id },
    {
      $inc: {
        lockedBalance: commissionAmount,
        totalConversions: 1,
      },
    },
    { session },
  );
};

/**
 * Approve a conversion when the order reaches "delivered" status.
 * Moves commission from lockedBalance → balance.
 */
export const approveConversion = async (
  orderId: string,
  session: ClientSession,
) => {
  const conversion = await AffiliateConversion.findOne({
    order: orderId,
    status: "pending",
  }).session(session);

  if (!conversion) return;

  conversion.status = "approved";
  conversion.approvedAt = new Date();
  await conversion.save({ session });

  await Affiliate.updateOne(
    { _id: conversion.affiliate },
    {
      $inc: {
        lockedBalance: -conversion.commissionAmount,
        balance: conversion.commissionAmount,
        totalEarned: conversion.commissionAmount,
      },
    },
    { session },
  );
};

/**
 * Reverse a conversion when an order is cancelled or refunded.
 */
export const reverseConversion = async (
  orderId: string,
  reason: string,
  session: ClientSession,
) => {
  const conversion = await AffiliateConversion.findOne({
    order: orderId,
    status: { $in: ["pending", "approved"] },
  }).session(session);

  if (!conversion) return;

  const wasApproved = conversion.status === "approved";
  conversion.status = "reversed";
  conversion.reversalReason = reason;
  await conversion.save({ session });

  // Reverse the balance change
  const inc: Record<string, number> = {
    totalConversions: -1,
  };

  if (wasApproved) {
    inc.balance = -conversion.commissionAmount;
    inc.totalEarned = -conversion.commissionAmount;
  } else {
    inc.lockedBalance = -conversion.commissionAmount;
  }

  await Affiliate.updateOne({ _id: conversion.affiliate }, { $inc: inc }, { session });
};

/**
 * Re-evaluate affiliate tier based on total conversions.
 * Called after a conversion is approved.
 */
export const recalculateTier = async (affiliateId: string) => {
  const program = await AffiliateProgram.findOne();
  if (!program || !program.tiers.length) return;

  const affiliate = await Affiliate.findById(affiliateId);
  if (!affiliate) return;

  // Sort tiers descending by minConversions, pick highest eligible
  const sorted = [...program.tiers].sort((a, b) => b.minConversions - a.minConversions);
  const matched = sorted.find((t) => affiliate.totalConversions >= t.minConversions);

  if (matched) {
    const tierMap: Record<string, "bronze" | "silver" | "gold" | "platinum"> = {
      Bronze: "bronze",
      Silver: "silver",
      Gold: "gold",
      Platinum: "platinum",
    };
    const newTier = tierMap[matched.name] ?? "bronze";
    if (affiliate.tier !== newTier || affiliate.commissionRate !== matched.commissionRate) {
      affiliate.tier = newTier;
      affiliate.commissionRate = matched.commissionRate;
      await affiliate.save();
    }
  }
};

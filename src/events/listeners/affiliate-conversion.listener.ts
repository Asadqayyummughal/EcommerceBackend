import mongoose from "mongoose";
import { appEventEmitter } from "../appEvents";
import { createConversion, approveConversion, reverseConversion, recalculateTier } from "../../affiliate/services/affiliate-tracking.service";
import { AffiliateConversion } from "../../models/affiliate-conversion.model";

console.log("[EVENT] Affiliate conversion listeners registered");

/** On payment success — create a pending conversion */
appEventEmitter.on(
  "affiliate.conversion.created",
  async ({ orderId, userId, affiliateCode, orderAmount }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await createConversion(orderId, userId, affiliateCode, orderAmount, session);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      console.error("[Affiliate] Failed to create conversion:", err);
    } finally {
      session.endSession();
    }
  },
);

/** On order delivered — approve the pending conversion (move locked → available) */
appEventEmitter.on(
  "order.status.changed",
  async ({ orderId, newStatus }) => {
    if (newStatus !== "delivered") return;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await approveConversion(orderId, session);
      await session.commitTransaction();

      // After committing, recalculate tier (non-transactional, best-effort)
      const conversion = await AffiliateConversion.findOne({ order: orderId });
      if (conversion) {
        await recalculateTier(conversion.affiliate.toString());
      }
    } catch (err) {
      await session.abortTransaction();
      console.error("[Affiliate] Failed to approve conversion:", err);
    } finally {
      session.endSession();
    }
  },
);

/** On order cancelled/reversed — reverse the conversion */
appEventEmitter.on(
  "affiliate.conversion.reversed",
  async ({ orderId, reason }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await reverseConversion(orderId, reason, session);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      console.error("[Affiliate] Failed to reverse conversion:", err);
    } finally {
      session.endSession();
    }
  },
);

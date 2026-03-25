import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as affiliateService from "../services/affiliate.service";
import * as trackingService from "../services/affiliate-tracking.service";

/** POST /api/affiliate/apply */
export const apply = asyncHandler(async (req: Request, res: Response) => {
  const { website, bio } = req.body;
  const affiliate = await affiliateService.applyForAffiliate(
    req.user.id,
    req.user.name,
    { website, bio },
  );
  res.status(201).json({ success: true, message: "Application submitted", data: affiliate });
});

/** GET /api/affiliate/me */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const affiliate = await affiliateService.getMyAffiliate(req.user.id);
  res.json({ success: true, data: affiliate });
});

/** GET /api/affiliate/stats */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await affiliateService.getAffiliateStats(req.user.id);
  res.json({ success: true, data: stats });
});

/** GET /api/affiliate/conversions */
export const getConversions = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const data = await affiliateService.getMyConversions(req.user.id, page, limit);
  res.json({ success: true, data });
});

/** GET /api/affiliate/payouts */
export const getPayouts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const data = await affiliateService.getMyPayouts(req.user.id, page, limit);
  res.json({ success: true, data });
});

/** POST /api/affiliate/payouts/request */
export const requestPayout = asyncHandler(async (req: Request, res: Response) => {
  const { amount, method, payoutDetails } = req.body;
  const payout = await affiliateService.requestPayout(
    req.user.id,
    amount,
    method,
    payoutDetails ?? {},
  );
  res.status(201).json({ success: true, message: "Payout requested", data: payout });
});

/**
 * GET /api/affiliate/track/:code
 * Records a click and returns cookie metadata (frontend sets the cookie).
 * Optionally pass ?product=<productId> for product-specific links.
 */
export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;
  const productId = req.query.product as string | undefined;

  const result = await trackingService.recordClick(code, req, productId);

  // Return cookie info — frontend is responsible for setting cookie
  res.json({
    success: true,
    data: {
      affiliateCode: result.code,
      clickId: result.clickId,
      cookieDurationDays: 30,
    },
  });
});

/** GET /api/affiliate/program */
export const getProgram = asyncHandler(async (_req: Request, res: Response) => {
  const program = await affiliateService.getProgram();
  res.json({ success: true, data: program });
});

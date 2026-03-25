import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as adminService from "../services/affiliate-admin.service";

/** GET /api/admin/affiliates */
export const listAffiliates = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const data = await adminService.listAffiliates(status, page, limit);
  res.json({ success: true, data });
});

/** PUT /api/admin/affiliates/:id/status */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, rejectionReason } = req.body;
  const affiliate = await adminService.updateAffiliateStatus(
    req.params.id,
    status,
    req.user.id,
    rejectionReason,
  );
  res.json({ success: true, message: "Affiliate status updated", data: affiliate });
});

/** GET /api/admin/affiliates/:id/conversions */
export const getConversions = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const data = await adminService.getAffiliateConversions(req.params.id, page, limit);
  res.json({ success: true, data });
});

/** GET /api/admin/affiliates/payouts */
export const listPayouts = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const data = await adminService.listPayouts(status, page, limit);
  res.json({ success: true, data });
});

/** PUT /api/admin/affiliates/payouts/:id/approve */
export const approvePayout = asyncHandler(async (req: Request, res: Response) => {
  const payout = await adminService.approvePayout(req.params.id, req.body.adminNote);
  res.json({ success: true, message: "Payout approved", data: payout });
});

/** PUT /api/admin/affiliates/payouts/:id/paid */
export const markPayoutPaid = asyncHandler(async (req: Request, res: Response) => {
  const payout = await adminService.markPayoutPaid(req.params.id);
  res.json({ success: true, message: "Payout marked as paid", data: payout });
});

/** PUT /api/admin/affiliates/payouts/:id/reject */
export const rejectPayout = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  const payout = await adminService.rejectPayout(req.params.id, reason);
  res.json({ success: true, message: "Payout rejected", data: payout });
});

/** GET /api/admin/affiliate-program */
export const getProgramSettings = asyncHandler(async (_req: Request, res: Response) => {
  const program = await adminService.getProgramSettings();
  res.json({ success: true, data: program });
});

/** PUT /api/admin/affiliate-program */
export const updateProgramSettings = asyncHandler(async (req: Request, res: Response) => {
  const program = await adminService.updateProgramSettings(req.body);
  res.json({ success: true, message: "Program settings updated", data: program });
});

/** GET /api/admin/affiliates/analytics */
export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getAffiliateAnalytics();
  res.json({ success: true, data });
});

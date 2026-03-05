import { Request, Response } from "express";
import * as VendorService from "../services/vendor.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const applyVendor = asyncHandler(async (req: Request, res: Response) => {
  const vendor = await VendorService.applyForVendor(req.user.id);
  res.status(201).json({ success: true, message: "Vendor application submitted", data: vendor });
});

export const getVendorsByStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status || req.body.status || "pending";
  const vendors = await VendorService.getVendorsByStatus(status as string);
  res.json({ success: true, data: vendors });
});

export const approveVendor = asyncHandler(async (req: Request, res: Response) => {
  const vendor = await VendorService.approveVendor(req.params.vendorId, req.user.id);
  res.json({ success: true, message: "Vendor approved", data: vendor });
});

export const onboardStripe = asyncHandler(async (req: Request, res: Response) => {
  const result = await VendorService.enableVendorStripeAccount(req.user.id);
  res.json({ success: true, data: result });
});

export const requestPayout = asyncHandler(async (req: Request, res: Response) => {
  const payout = await VendorService.requestPayout(req.body, req.body.vendorId);
  res.status(201).json({ success: true, message: "Payout requested", data: payout });
});

export const approvedPayout = asyncHandler(async (req: Request, res: Response) => {
  const payout = await VendorService.approvePayout(req.params.id);
  res.json({ success: true, message: "Payout approved", data: payout });
});

export const listAllPayouts = asyncHandler(async (_req: Request, res: Response) => {
  const payouts = await VendorService.listAllPayouts();
  res.json({ success: true, data: payouts });
});

export const payoutVendor = asyncHandler(async (req: Request, res: Response) => {
  const payouts = await VendorService.payoutVendor(req.user.id, req.params.id);
  res.json({ success: true, message: "Payout processed", data: payouts });
});

export const getWalletDetail = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await VendorService.getVendorWalletDetail(req.params.vendorId);
  res.json({ success: true, data: wallet });
});

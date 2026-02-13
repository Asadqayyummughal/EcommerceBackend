import { Request, Response } from "express";
import * as VendorService from "../services/vendor.service";
export const applyVendor = async (req: Request, res: Response) => {
  try {
    let userId = req.user.id;
    let vendor = await VendorService.applyForVendor(userId);
    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: false,
      message: Error.message,
    });
  }
};

export const getVendorsByStatus = async (req: Request, res: Response) => {
  try {
    let status = req.body.status || "pending";
    let vendor = await VendorService.getVendorsByStatus(status);
    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: false,
      message: Error.message,
    });
  }
};
export const approveVendor = async (req: Request, res: Response) => {
  try {
    let vendor = await VendorService.approveVendor(
      req.params.vendorId,
      req.user.id,
    );
    return res.status(201).json({
      success: true,
      data: vendor,
    });
  } catch (Error: any) {
    return res.status(401).json({
      success: false,
      message: Error.message,
    });
  }
};
export const onboardStripe = async (req: Request, res: Response) => {
  try {
    let result = await VendorService.enableVendorStripeAccount(req.user.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (Error: any) {
    return res.status(401).json({
      success: false,
      message: Error.message,
    });
  }
};
export const requestPayout = async (req: Request, res: Response) => {
  try {
    let payout = await VendorService.requestPayout(req.body, req.body.vendorId);
    return res.status(201).json({
      success: true,
      data: payout,
    });
  } catch (Error: any) {
    return res.status(401).json({
      success: false,
      message: Error.message,
    });
  }
};

export const approvedPayout = async (req: Request, res: Response) => {
  try {
    let payout = await VendorService.approvePayout(req.params.id);
    return res.status(200).json({
      success: true,
      data: payout,
    });
  } catch (Error: any) {
    return res.status(401).json({
      success: false,
      message: Error.message,
    });
  }
};
export const listAllPayouts = async (req: Request, res: Response) => {
  try {
    let payouts = await VendorService.listAllPayouts();
    return res.status(200).json({
      success: true,
      data: payouts,
    });
  } catch (Error: any) {
    return res.status(401).json({
      success: false,
      message: Error.message,
    });
  }
};

export const payoutVendor = async (req: Request, res: Response) => {
  try {
    const { vendorId, amount } = req.body;
    let payouts = await VendorService.payoutVendor(vendorId, amount);
    return res.status(200).json({
      success: true,
      data: payouts,
    });
  } catch (Error: any) {
    return res.status(401).json({
      success: false,
      message: Error.message,
    });
  }
};

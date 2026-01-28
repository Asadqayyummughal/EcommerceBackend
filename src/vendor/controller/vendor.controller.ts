import { Request, Response } from "express";
import * as VendorController from "../services/vendor.service";
export const applyVendor = async (req: Request, res: Response) => {
  try {
    let userId = req.user.id;
    let vendor = await VendorController.applyVendor(userId);
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
    let vendor = await VendorController.getVendorsByStatus(status);
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
    let vendor = await VendorController.approveVendor(
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

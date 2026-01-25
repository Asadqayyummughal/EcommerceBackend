import { Request, Response } from "express";
import * as VendorController from "../services/vendor.service";
export const applyVendor = async (req: Request, res: Response) => {
  try {
    let userId = req.user.id;
    let vendors = await VendorController.applyVendor(userId);
    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: false,
      message: Error.meessage,
    });
  }
};

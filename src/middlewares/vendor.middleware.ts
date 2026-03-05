import { Vendor } from "../models/vendor.model";
import { NextFunction, Request, Response } from "express";

export const requireActiveVendor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || vendor.status !== "active") {
      return res.status(403).json({ success: false, message: "Vendor account not approved" });
    }
    next();
  } catch (err) {
    next(err);
  }
};

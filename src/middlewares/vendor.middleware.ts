import { Vendor } from "../models/vendor.model";
import { NextFunction, Request, Response } from "express";

export const requireActiveVendor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor || vendor.status !== "active") {
    return res.status(403).json({ message: "Vendor not approved" });
  }
  //   req.vendor = vendor;
  next();
};

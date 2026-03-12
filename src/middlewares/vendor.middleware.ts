import { Vendor } from "../models/vendor.model";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export const requireActiveVendor = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || vendor.status !== "active") {
      return next(new AppError("Vendor account not approved", 403));
    }
    next();
  } catch (err) {
    next(err);
  }
};

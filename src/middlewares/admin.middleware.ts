import { Request, Response, NextFunction } from "express";
import Role from "../models/role.model";
import { AppError } from "../utils/AppError";

export const isAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const role = await Role.findOne({
      _id: req.user.role,
      name: "admin",
    });
    if (!role) {
      return next(new AppError("Access denied. Admin privileges required.", 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

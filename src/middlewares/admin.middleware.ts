import { Request, Response, NextFunction } from "express";
import Role from "../models/role.model";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = await Role.findOne({
      _id: req.user.role,
      name: "admin",
    });
    if (!role) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

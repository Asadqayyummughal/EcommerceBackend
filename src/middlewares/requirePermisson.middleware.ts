import Role from "../models/role.model";
import { NextFunction, Request, Response } from "express";

export const requirePermission = (permissionKey: string) => {
  return async (req: Request, res: Response, next: any) => {
    const user = req.user;
    if (!user || !user.role) {
      return res.status(403).json({ message: "Access denied" });
    }
    const role = await Role.findById({ _id: user.role }).populate(
      "permissions",
    );
    // 🔑 Super Admin → full access
    if (!role) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (role.permissions === null) {
      return next();
    }
    const hasPermission = role.permissions.some(
      (p: any) => p.key === permissionKey,
    );
    if (!hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions",
        permission: permissionKey,
      });
    }
    next();
  };
};

// export const authorize = (requiredPermission: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const user = req.user;

//     if (!user?.role) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     // Admin shortcut
//     if (user.role.name === "admin") return next();

//     const permissions = user.role.permissions.map((p) => p.key);

//     if (!permissions.includes(requiredPermission)) {
//       return res.status(403).json({ message: "Permission denied" });
//     }

//     next();
//   };
// };

import Role from "../models/role.model";

export const requirePermission = (permissionKey: string) => {
  // return async (req: Request, res: Response, next: any) => {
  //   const user = req.user;
  //   if (!user || !user.role) {
  //     return res.status(403).json({ message: "Access denied" });
  //   }
  //   const role = await Role.find({name:user.role}).populate("permissions");
  //   // 🔑 Super Admin → full access
  //   if (!role) {
  //     return res.status(403).json({ message: "Access denied" });
  //   }
  //   if (role.permissions === null) {
  //     return next();
  //   }
  //   const hasPermission = role.permissions.some(
  //     (p: any) => p.key === permissionKey,
  //   );
  //   if (!hasPermission) {
  //     return res.status(403).json({
  //       message: "Insufficient permissions",
  //       permission: permissionKey,
  //     });
  //   }
  //   next();
  // };
};

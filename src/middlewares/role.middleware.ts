// middlewares/role.middleware.ts
import { Request, Response, NextFunction } from "express";
export const roleMiddleware =
  (role: string) => (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole; // ensure authMiddleware attached userRole on req
    if (!userRole || userRole !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

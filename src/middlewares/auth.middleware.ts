import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/express";
import { AppError } from "../utils/AppError";

interface JwtPayload {
  email: string | undefined;
  id: string;
  role: string;
}

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer")) {
      return next(new AppError("Unauthorized — No token provided", 401));
    }
    token = token.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthUser;

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      phone: decoded.phone,
      role: decoded.role,
    };
    next();
  } catch (err) {
    next(new AppError("Invalid or expired token", 401));
  }
};

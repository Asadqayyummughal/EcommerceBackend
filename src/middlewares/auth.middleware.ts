import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/express";

interface JwtPayload {
  email: string | undefined;
  id: string;
  role: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization;
    // No token sent
    if (!token || !token.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — No token provided",
      });
    }
    // Extract token
    token = token.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthUser;
    // attach user id to request object

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      phone: decoded.phone,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

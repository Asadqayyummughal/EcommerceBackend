import { Types } from "mongoose";
import { IUser } from "../models/user.model";
export interface AuthUser {
  id: string; // or Types.ObjectId if you use ObjectId in JWT
  name: string;
  email: string;
  phone: string;
  role: string;
}
declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

export {};

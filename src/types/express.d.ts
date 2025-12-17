import { Types } from "mongoose";

declare global {
  namespace Express {
    interface User {
      id: string; // or Types.ObjectId
      email?: string;
      role?: string;
    }

    interface Request {
      user: User;
    }
  }
}

export {};

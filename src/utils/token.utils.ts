import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";

export const generateToken = async (user: IUser) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );
  return token;
};

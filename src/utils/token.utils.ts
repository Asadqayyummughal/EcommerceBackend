import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";

export const generateAccessToken = (user: IUser) => {
  const { _id, email, name, role } = user;
  return jwt.sign(
    { id: _id, email: email, name: name, role: role },
    process.env.JWT_SECRET!,
    { expiresIn: "60m" },
  );
};

export const generateRefreshToken = (user: IUser) => {
  const { _id, email, name, role } = user;
  return jwt.sign(
    { id: _id, email: email, name: name, role: role },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    },
  );
};

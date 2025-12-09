import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";

export const getAllUsersService = async (): Promise<IUser[]> => {
  return User.find().lean();
};

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

export const updateProfile = async (userId: string, data: any) => {
  const { name, email, phone } = data;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email, phone },
    { new: true, runValidators: true }
  ).select("-password");
  if (!updatedUser) throw new Error("User not found");
  return updatedUser;
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};

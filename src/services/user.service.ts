import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

export const updateProfile = async (userId: string, data: any) => {
  const user = await User.findById(userId);
  const updateData = { ...data };
  if (data.email == user?.email) {
    delete updateData.email;
  }
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  return updatedUser;
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};
export const uploadProfileImage = async (userId: string, filePath: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // DELETE OLD IMAGE SAFELY
  if (user.image) {
    const oldPath = path.join(__dirname, "../", user.image);

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }
  // Save new image
  const shortPath = "uploads/profile/" + path.basename(filePath);
  user.image = shortPath;
  await user.save();

  return user;
};

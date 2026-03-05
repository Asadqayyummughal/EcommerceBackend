import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getProfileController = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user.id);
  res.json({ success: true, data: user });
});

export const updateProfileController = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json({ success: true, message: "Profile updated", data: user });
});

export const changePasswordController = asyncHandler(async (req: Request, res: Response) => {
  await userService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
  res.json({ success: true, message: "Password updated successfully" });
});

export const uploadImageController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const user = await userService.uploadProfileImage(req.params.id, req.file.path);
  res.json({ success: true, message: "Image updated", data: { image: user.image } });
});

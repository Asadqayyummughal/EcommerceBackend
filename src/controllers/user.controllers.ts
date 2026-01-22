import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getProfileController = async (req: Request, res: Response) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfileController = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateProfile(req.body.id, req.body);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    await userService.changePassword(
      req.body.id,
      req.body.oldPassword,
      req.body.newPassword,
    );
    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadImageController = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    let id = req.params.id;

    if (!id) return res.status(400).json({ message: "userId missing" });
    if (id) {
      const user = await userService.uploadProfileImage(id, req.file.path);
      res.json({
        message: "Image updated",
        image: user.image,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

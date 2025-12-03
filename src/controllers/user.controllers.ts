import { Request, Response } from "express";
import {
  getAllUsersService,
  createUserService,
} from "../services/user.service";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersService();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res
        .status(400)
        .json({ success: false, message: "name and email are required" });
      return;
    }
    const user = await createUserService({ name, email } as any);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    return res.json({
      success: true,
      message: "Profile fetched successfully",
      userId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

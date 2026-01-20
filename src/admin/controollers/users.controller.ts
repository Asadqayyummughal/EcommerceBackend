import Role from "../../models/role.model";
import User, { IUser } from "../../models/user.model";
import * as userService from "../services/users.service";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsersService();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

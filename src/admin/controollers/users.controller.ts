import * as userService from "../services/users.service";
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.getAllUsersService();
  res.json({ success: true, data: users });
});

import { Request, Response } from "express";
import {
  loginService,
  signupService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await signupService({ name, email, password });
  res.status(201).json({ success: true, message: "User registered successfully", data: user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginService(email, password);
  res.json({ success: true, data: { user, accessToken, refreshToken } });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await refreshTokenService(refreshToken);
  res.json({ success: true, data: { accessToken: result.accessToken, refreshToken: result.refreshToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await logoutService(refreshToken);
  res.json({ success: true, message: "Logged out successfully" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await forgotPasswordService(email);
  res.json({ success: true, message: "Password reset link sent to your email" });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  await resetPasswordService(token, newPassword);
  res.json({ success: true, message: "Password reset successful" });
});

import { Request, Response } from "express";
import {
  loginService,
  signupService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service";
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "All fields required" });
      return;
    }
    const user = await signupService({ name, email, password });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // tokens
  let { user, accessToken, refreshToken } = await loginService(email, password);
  return res.json({
    accessToken,
    refreshToken,
    user: user,
  });
};
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshTokenService(refreshToken);

    return res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await logoutService(refreshToken);

    return res.json({ message: "Logged out successfully" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await forgotPasswordService(email);

    return res.json({
      message: "Password reset link sent to your email",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    await resetPasswordService(token, newPassword);
    return res.json({ message: "Password reset successful" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user.model";
import {
  generateRefreshToken,
  generateAccessToken,
} from "../utils/token.utils";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "./email.service";
import { validateEmailDomain } from "../utils/validateEmailDomain";
import { AppError } from "../utils/AppError";

export const signupService = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = data;
  await validateEmailDomain(email);
  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already exists", 409);
  // Hash password
  const hashedPass = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPass,
  });

  return user;
};

const MAX_SESSIONS = 5;

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid email or password", 401);
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const now = new Date();
  // Remove expired tokens, then cap to MAX_SESSIONS (keep the most recent)
  user.refreshTokens = user.refreshTokens
    .filter((rt) => rt.expiresAt > now)
    .slice(-MAX_SESSIONS + 1);

  const hashedRefresh = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshTokens.push({
    token: hashedRefresh,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();
  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

// services/auth.service.ts
export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) throw new AppError("Refresh token required", 400);
  // 1️⃣ Convert incoming token to hashed form
  const hashedRefresh = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  // 2️⃣ Find a user with this refresh token
  const user = await User.findOne({
    "refreshTokens.token": hashedRefresh,
  });

  if (!user) throw new AppError("Invalid refresh token", 401);

  // 3️⃣ Check the DB-stored expiry first (fast, no crypto)
  const storedToken = user.refreshTokens.find((rt) => rt.token === hashedRefresh);
  if (!storedToken || storedToken.expiresAt <= new Date()) {
    // Token is expired — remove it from DB before rejecting
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashedRefresh);
    await user.save();
    throw new AppError("Expired refresh token", 401);
  }

  // 4️⃣ Validate the JWT signature and expiry
  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch (err) {
    // JWT expired or tampered — remove from DB
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashedRefresh);
    await user.save();
    throw new AppError("Expired refresh token", 401);
  }

  // 5️⃣ Delete old refresh token (Token Rotation)
  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== hashedRefresh,
  );

  // 5️⃣ Generate new refresh token
  const newRefreshToken = generateRefreshToken(user);
  const newHashedRefresh = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshTokens.push({
    token: newHashedRefresh,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  // 6️⃣ Create new access token
  const newAccessToken = generateAccessToken(user);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
export const logoutService = async (refreshToken: string) => {
  if (!refreshToken) throw new AppError("Refresh token required", 400);

  const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");

  // Find user with this refresh token
  const user = await User.findOne({
    "refreshTokens.token": hashed,
  });

  if (!user) throw new AppError("Invalid refresh token", 401);

  // Remove this refresh token (logout)
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashed);

  await user.save();
  return true;
};

export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  // Build Reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Email HTML Template
  const emailHTML = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">
      Reset Password
    </a>
    <br/><br/>
    <strong>Note:</strong> This link expires in 15 minutes.
  `;

  // Send Email
  await sendEmail(user.email, "Reset Your Password", emailHTML);

  return true; // no need to return token now
};

export const resetPasswordService = async (
  resetToken: string,
  newPassword: string,
) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError("Invalid or expired token", 400);

  user.password = await bcrypt.hash(newPassword, 10);

  // Clear reset fields and invalidate all sessions (force re-login on all devices)
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = [];

  await user.save();

  return true;
};

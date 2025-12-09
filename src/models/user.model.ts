import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  refreshTokens: RefreshToken[];
  // FORGOT PASSWORD
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}
export interface RefreshToken {
  token: string;
  expiresAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],
    // FORGOT PASSWORD
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;

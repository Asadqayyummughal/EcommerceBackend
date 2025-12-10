import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  image?: string;
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
    phone: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "uploads/profile/default.jpg" },
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

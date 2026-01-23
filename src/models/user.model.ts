import mongoose, { Document, Model } from "mongoose";
import { USER_ROLES, UserRole } from "./role.model";
export interface IUser extends Document {
  id?: string;
  name: string;
  role: mongoose.Types.ObjectId;
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
    role: {
      type: mongoose.Types.ObjectId,
      ref: "Role",
    }, // enum for type safe
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
  { timestamps: true },
);
userSchema.pre("save", async function () {
  if (this.isNew && !this.role) {
    const defaultRole = await mongoose.model("Role").findOne({ name: "user" });
    if (!defaultRole) {
      throw new Error("Default 'user' role not found in database");
      // or: create it here if you want auto-seed behavior
    }

    this.role = defaultRole._id;
  }

  // No need to call next() — mongoose waits for the promise automatically
});
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;

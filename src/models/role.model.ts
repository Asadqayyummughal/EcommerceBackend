// models/role.model.ts
import { Schema, model, Document, Types } from "mongoose";
// roles.ts (or constants/roles.ts)
export const USER_ROLES = ["admin", "seller", "support", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export interface IRole extends Document {
  name: UserRole;
  permissions: Types.ObjectId[] | null; // null = full access (god mode)
  description?: string; // optional – good practice
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: USER_ROLES,
      lowercase: true, // normalize
      trim: true,
    },

    permissions: {
      type: [Schema.Types.ObjectId],
      ref: "Permission", // ← must match your Permission model's name
      default: [], // empty array by default (not null)
      // null is allowed → means full access
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true, // automatically adds createdAt + updatedAt
  },
);

// Optional: prevent saving null permissions as [] (if you strictly want null)
roleSchema.pre("save", function () {
  if (this.permissions === null) {
    // keep null → full access
  } else if (!Array.isArray(this.permissions)) {
    this.permissions = [];
  }
});

// Optional: index on name (faster lookups)
roleSchema.index({ name: 1 });

const Role = model<IRole>("Role", roleSchema);

export default Role;

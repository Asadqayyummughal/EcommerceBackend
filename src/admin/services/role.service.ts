import mongoose, { Types } from "mongoose";
import Permission from "../../models/permission.model";
import Role, { UserRole } from "../../models/role.model";
import User from "../../models/user.model";
import { toObjectIds } from "../../utils/helpers.utils";

export const createRole = async (
  name: UserRole,
  description: string,
  permissions: Array<string>,
) => {
  let permissionIds: null | Array<Types.ObjectId>;
  const exists = await Role.findOne({ name });
  if (exists) throw new Error("Role already exists");
  if (name !== "admin" && !permissions)
    throw new Error("Kindly provide the role permissions");
  if (name == "admin") {
    permissionIds = null;
  } else {
    const permissionDocs = await Permission.find({
      _id: { $in: permissions },
    });
    const foundIds = permissionDocs.map((p) => p._id.toString());
    const invalidKeys = permissions.filter((id) => !foundIds.includes(id));
    if (invalidKeys.length) {
      throw new Error(`Invalid permissions: ${invalidKeys.join(", ")}`);
    }
    permissionIds = toObjectIds(permissions);
  }
  const role = await Role.create({
    name,
    description,
    permissions: permissionIds,
  });
  return role;
};

export const listRoles = async () => {
  const roles = await Role.find().populate("permissions");
  return roles;
};

export const getRole = async (roleId: string) => {
  const role = await Role.findById(roleId).populate("permissions");
  if (!role) throw new Error("Role not found");
  return role;
};

export const updateRole = async (
  roleId: string,
  name: string,
  permissions: (string | Types.ObjectId)[],
) => {
  let updateData: any = {};
  if (name) updateData.name = name;

  if (permissions !== undefined) {
    if (permissions === null) {
      updateData.permissions = null;
    } else {
      const permissionDocs = await Permission.find({
        _id: { $in: permissions },
      });
      if (permissionDocs.length !== permissions.length) {
        throw new Error("Invalid permissions");
      }
      updateData.permissions = permissionDocs.map((p) => p._id);
    }
  }
  const role = await Role.findByIdAndUpdate(roleId, updateData, {
    new: true,
  }).populate("permissions");

  if (!role) throw new Error("Role not found");
  return role;
};

export const deleteRole = async (roleId: string) => {
  const role = await Role.findById(roleId);
  if (!role) throw new Error("Role not found");
  if (role.name === "admin") {
    throw new Error("Admin role cannot be deleted");
  }

  let res = await role.deleteOne();
  return res;
};

export const assignRoleToUser = async (roleId: string, userId: string) => {
  const role = await Role.findById(roleId);
  if (!role) throw new Error("Role not found");
  const user = await User.findByIdAndUpdate(
    userId,
    { role: role._id },
    { new: true },
  ).populate("role");
  if (!user) throw new Error("User not found");
  return user;
};

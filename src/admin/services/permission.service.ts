import Permission from "../../models/permission.model";
import { AppError } from "../../utils/AppError";

export const createPermission = async (
  key: string,
  description: string,
  module: string
) => {
  const exists = await Permission.findOne({ key });
  if (exists) throw new AppError("Permission already exists", 409);
  const permission = await Permission.create({ key, description, module });
  return permission;
};

export const listPermissions = async () => {
  const permissions = await Permission.find().sort({ module: 1 });
  return permissions;
};

export const updatePermission = async (_id: string, update: {}) => {
  const permission = await Permission.findByIdAndUpdate(_id, update, {
    new: true,
  });
  if (!permission) throw new AppError("Permission not found", 404);
  return permission;
};

export const deletePermission = async (_id: string) => {
  let res = await Permission.findByIdAndDelete(_id);
};

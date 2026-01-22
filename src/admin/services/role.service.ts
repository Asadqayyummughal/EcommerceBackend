import Permission from "../../models/permission.model";
import Role, { UserRole } from "../../models/role.model";
import User from "../../models/user.model";

export const createRole = async (
  name: UserRole,
  description: string,
  permissions: Array<string>,
) => {
  const exists = await Role.findOne({ name });
  if (exists) throw new Error("Role already exists");
  // null permissions = full access role
  debugger;
  if (permissions !== null) {
    const permissionDocs = await Permission.find({
      _id: { $in: permissions },
    });
    const foundKeys = permissionDocs.map((p) => p._id.toString());
    const invalidKeys = permissions.filter((p) => !foundKeys.includes(p));
    if (invalidKeys.length) {
      throw new Error(`Invalid permissions: ${invalidKeys.join(", ")}`);
    }
  } else {
    if (name !== "admin" && !permissions)
      throw new Error("Kindly provide the role permissions");
  }

  const role = await Role.create({
    name,
    description,
    permissions: permissions,
  });
  return role;
};

export const listRoles = async () => {
  const roles = await Role.find().populate("permissions");
  return roles;
};

// export const getRole = async (req, res) => {
//   const role = await Role.findById(req.params.id).populate("permissions");
//   if (!role) throw new Error("Role not found");
//   res.json(role);
// };

// export const updateRole = async (req, res) => {
//   const { name, permissions } = req.body;

//   let updateData: any = {};
//   if (name) updateData.name = name;

//   if (permissions !== undefined) {
//     if (permissions === null) {
//       updateData.permissions = null;
//     } else {
//       const permissionDocs = await Permission.find({
//         key: { $in: permissions },
//       });

//       if (permissionDocs.length !== permissions.length) {
//         throw new Error("Invalid permission keys provided");
//       }

//       updateData.permissions = permissionDocs.map((p) => p._id);
//     }
//   }

//   const role = await Role.findByIdAndUpdate(
//     req.params.id,
//     updateData,
//     { new: true }
//   ).populate("permissions");

//   if (!role) throw new Error("Role not found");
//   res.json(role);
// };

// export const deleteRole = async (req, res) => {
//   const role = await Role.findById(req.params.id);
//   if (!role) throw new Error("Role not found");

//   if (role.name === "super_admin") {
//     throw new Error("Super admin role cannot be deleted");
//   }

//   await role.deleteOne();
//   res.json({ message: "Role deleted" });
// };

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

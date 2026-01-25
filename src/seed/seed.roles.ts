import { PERMISSION_MATRIX } from "../config/permission-matrix";
import Permission from "../models/permission.model";
import Role from "../models/role.model";

export const seedRoles = async () => {
  for (const [roleName, perms] of Object.entries(PERMISSION_MATRIX)) {
    let permissionIds = [];
    if (perms.includes("*")) {
      permissionIds = (await Permission.find()).map((p) => p._id);
    } else {
      permissionIds = (await Permission.find({ key: { $in: perms } })).map(
        (p) => p._id,
      );
    }
    await Role.updateOne(
      { name: roleName },
      {
        name: roleName,
        permissions: permissionIds,
      },
      { upsert: true },
    );
  }

  console.log("✅ Roles synced");
};

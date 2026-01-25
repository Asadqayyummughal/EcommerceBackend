import { PERMISSION_MATRIX } from "../config/permission-matrix";
import Permission from "../models/permission.model";

export const seedPermissions = async () => {
  const uniqueKeys = new Set<string>();

  Object.values(PERMISSION_MATRIX).forEach((perms) => {
    perms.forEach((p) => {
      if (p !== "*") uniqueKeys.add(p);
    });
  });

  for (const key of uniqueKeys) {
    await Permission.updateOne(
      { key },
      { key, description: key },
      { upsert: true },
    );
  }

  console.log("✅ Permissions synced");
};

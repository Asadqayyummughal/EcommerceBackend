// routes/admin/roles.ts

import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as rolesController from "../controollers/role.controller";
import { requirePermission } from "../../middlewares/requirePermisson.middleware";
const router = Router();
router.post(
  "/",
  authMiddleware,
  // requirePermission("role.manage"),
  rolesController.createRole,
);
router.get(
  "/",
  authMiddleware,
  // requirePermission("role.manage"),
  rolesController.listRoles,
);
router.put(
  "/assignRole",
  authMiddleware,
  // requirePermission("role.manage"),
  rolesController.assignRoleToUser,
);
router.get(
  "/:id",
  authMiddleware,
  // requirePermission("role.manage"),
  rolesController.getRole,
);
router.put(
  "/:id",
  authMiddleware,
  // requirePermission("role.manage"),
  rolesController.updateRole,
);
router.delete(
  "/:id",
  authMiddleware,
  // requirePermission("role.manage"),
  rolesController.deleteRole,
);

export default router;

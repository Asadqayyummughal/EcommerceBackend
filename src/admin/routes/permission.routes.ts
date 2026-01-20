// routes/admin/permissions.ts
import Router from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as permissionController from "../controollers/permission.controller";
const router = Router();

router.post(
  "/",
  authMiddleware,
  //   requirePermission("permission.manage"),
  permissionController.createPermission
);
router.get(
  "/",
  authMiddleware,
  //   requirePermission("permission.manage"),
  permissionController.listPermissions
);
// router.put(
//   "/:id",
//   authMiddleware,
//   //   requirePermission("permission.manage"),
//   updatePermission
// );
// router.delete(
//   "/:id",
//   authMiddleware,
//   //   requirePermission("permission.manage"),
//   deletePermission
// );
export default router;

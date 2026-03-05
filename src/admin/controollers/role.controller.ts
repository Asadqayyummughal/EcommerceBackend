import { Response, Request } from "express";
import * as rolesService from "../services/role.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, permissions } = req.body;
  const role = await rolesService.createRole(name, description, permissions);
  res.status(201).json({ success: true, message: "Role created", data: role });
});

export const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await rolesService.listRoles();
  res.json({ success: true, data: roles });
});

export const assignRoleToUser = asyncHandler(async (req: Request, res: Response) => {
  const { roleId, userId } = req.body;
  const user = await rolesService.assignRoleToUser(roleId, userId);
  res.json({ success: true, message: "Role assigned", data: user });
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await rolesService.getRole(req.params.id);
  res.json({ success: true, data: role });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await rolesService.deleteRole(req.params.id);
  res.json({ success: true, message: "Role deleted", data: role });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, permissions } = req.body;
  const updated = await rolesService.updateRole(req.params.id, name, permissions);
  res.json({ success: true, message: "Role updated", data: updated });
});

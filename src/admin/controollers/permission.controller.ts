import { Request, Response } from "express";
import * as permissionService from "../services/permission.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createPermission = asyncHandler(async (req: Request, res: Response) => {
  const { key, description, module } = req.body;
  const permission = await permissionService.createPermission(key, description, module);
  res.status(201).json({ success: true, message: "Permission created", data: permission });
});

export const listPermissions = asyncHandler(async (_req: Request, res: Response) => {
  const permissions = await permissionService.listPermissions();
  res.json({ success: true, data: permissions });
});

export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  const permission = await permissionService.updatePermission(req.params.id, req.body);
  res.json({ success: true, message: "Permission updated", data: permission });
});

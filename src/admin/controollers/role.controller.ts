import { Response, Request } from "express";
import * as rolesService from "../services/role.service";

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;
    let roles = await rolesService.createRole(name, description, permissions);
    res.status(201).json({
      success: true,
      data: roles,
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};

export const listRoles = async (req: Request, res: Response) => {
  try {
    let roles = await rolesService.listRoles();
    res.status(201).json({
      success: true,
      data: roles,
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};

export const assignRoleToUser = async (req: Request, res: Response) => {
  const roleId = req.body.roleId;
  let user = await rolesService.assignRoleToUser(roleId, req.user.id);
  res.json(user);
};

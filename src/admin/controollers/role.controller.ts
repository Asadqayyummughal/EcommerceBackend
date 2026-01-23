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

export const getRole = async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    let role = await rolesService.getRole(id);
    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    let role = await rolesService.deleteRole(id);
    res.status(201).json({
      success: true,
      data: role,
      message: "Role deleted",
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    let roleId = req.params.id;
    const { name, permissions } = req.body;
    let update = await rolesService.updateRole(roleId, name, permissions);
    res.status(201).json({
      success: true,
      data: update,
      message: "Role updated",
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};

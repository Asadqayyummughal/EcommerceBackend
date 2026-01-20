import { Request, Response } from "express";
import * as permissionService from "../services/permission.service";

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { key, description, module } = req.body;
    let permission = await permissionService.createPermission(
      key,
      description,
      module
    );
    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};
export const listPermissions = async (req: Request, res: Response) => {
  try {
    let permissions = await permissionService.listPermissions();
    res.status(201).json({
      success: true,
      data: permissions,
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { key, description, module } = req.body;
    let permission = await permissionService.createPermission(
      key,
      description,
      module
    );
    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (Error: any) {
    res.status(401).json({
      success: false,
      messge: Error.message,
    });
  }
};

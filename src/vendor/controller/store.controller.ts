import { Request, Response } from "express";
import * as storeService from "../services/store.service";
export const createStore = async (req: Request, res: Response) => {
  try {
    let store = await storeService.createStore(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: false,
      Error: Error.message,
    });
  }
};

export const approveStore = async (req: Request, res: Response) => {
  try {
    let store = await storeService.approveStore(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: true,
      Error: Error.message,
    });
  }
};
export const listStores = async (req: Request, res: Response) => {
  try {
    let stores = await storeService.listAllStores();
    res.status(200).json({
      success: true,
      data: stores,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: false,
      Error: Error.message,
    });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    let store = await storeService.updateStore(
      req.user.id,
      req.params.id,
      req.body,
    );
    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: false,
      Error: Error.message,
    });
  }
};

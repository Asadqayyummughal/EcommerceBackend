import { Request, Response } from "express";
import * as returnService from "../services/return.service";

// user only
export const createReturn = async (req: Request, res: Response) => {
  try {
    const payload = { ...req.body };
    const product = await returnService.createReturnRequest(
      req.user.id,
      payload
    );
    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
//below all are admin only
export const approveReturn = async (req: Request, res: Response) => {
  try {
    const returnId = req.params.id;
    const rma = await returnService.approveReturn(returnId);
    return res.status(201).json({ success: true, rma });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
export const rejectReturn = async (req: Request, res: Response) => {
  try {
    const rmaId = req.params.id;
    const adminNote = req.body.adminNote;
    const rma = await returnService.rejectReturn(rmaId, adminNote);
    return res.status(201).json({ success: true, rma });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const marReturnReceived = async (req: Request, res: Response) => {
  try {
    const returnId = req.params.id;
    const rma = await returnService.markReturnReceived(returnId);
    return res.status(201).json({ success: true, rma });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
//admin only
export const getAllReturns = async (req: Request, res: Response) => {
  try {
    const rma = await returnService.getAllReturns();
    return res.status(201).json({ success: true, rma });
  } catch {}
};

export const refundReturn = async (req: Request, res: Response) => {
  try {
    const returnId = req.params.id;
    const mehtod = req.body.refundMethod;
    const rma = await returnService.refundReturn(returnId, mehtod);
    return res.status(201).json({ success: true, rma });
  } catch {}
};

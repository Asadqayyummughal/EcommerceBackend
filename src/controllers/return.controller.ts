import { Request, Response } from "express";
import * as returnService from "../services/return.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createReturn = asyncHandler(async (req: Request, res: Response) => {
  const product = await returnService.createReturnRequest(req.user.id, { ...req.body });
  res.status(201).json({ success: true, message: "Return request created", data: product });
});

export const approveReturn = asyncHandler(async (req: Request, res: Response) => {
  const rma = await returnService.approveReturn(req.params.id);
  res.json({ success: true, message: "Return approved", data: rma });
});

export const rejectReturn = asyncHandler(async (req: Request, res: Response) => {
  const rma = await returnService.rejectReturn(req.params.id, req.body.adminNote);
  res.json({ success: true, message: "Return rejected", data: rma });
});

export const marReturnReceived = asyncHandler(async (req: Request, res: Response) => {
  const rma = await returnService.markReturnReceived(req.params.id);
  res.json({ success: true, message: "Return marked as received", data: rma });
});

export const getAllReturns = asyncHandler(async (_req: Request, res: Response) => {
  const rma = await returnService.getAllReturns();
  res.json({ success: true, data: rma });
});

export const refundReturn = asyncHandler(async (req: Request, res: Response) => {
  const rma = await returnService.refundReturn(req.params.id, req.body.refundMethod);
  res.json({ success: true, message: "Refund processed", data: rma });
});

import { Request, Response } from "express";
import * as shipmentService from "../services/shipment.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const crateShipment = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentService.createShipment(req.body);
  res.status(201).json({ success: true, message: "Shipment created", data: shipment });
});

export const markShipmentDelivered = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentService.markShipmentDelivered(req.params.id);
  res.json({ success: true, message: "Shipment marked as delivered", data: shipment });
});

export const markShipmentShipped = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentService.markShipmentShipped(req.params.id);
  res.json({ success: true, message: "Shipment marked as shipped", data: shipment });
});

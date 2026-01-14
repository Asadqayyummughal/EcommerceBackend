import { Request, Response } from "express";
import * as shipmentService from "../services/shipment.service";
export const crateShipment = async (req: Request, res: Response) => {
  const order = await shipmentService.createShipment(req.body);
  res.json(order);
};
export const markShipmentDelivered = async (req: Request, res: Response) => {
  const order = await shipmentService.markShipmentDelivered(req.params.id);
  res.json(order);
};

export const markShipmentShipped = async (req: Request, res: Response) => {
  const order = await shipmentService.markShipmentShipped(req.params.id);
  res.json(order);
};

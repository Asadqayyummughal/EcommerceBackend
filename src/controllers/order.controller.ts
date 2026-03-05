import { Request, Response } from "express";
import * as orderService from "../services/order.service";
import { asyncHandler } from "../utils/asyncHandler";

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.checkoutOrder(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Order placed successfully", data: order });
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.json({ success: true, data: orders });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.user, req.params.id);
  res.json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(req.user.id, req.params.id);
  res.json({ success: true, message: "Order cancelled", data: order });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status, req.user.id);
  res.json({ success: true, message: "Order status updated", data: order });
});

export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderTracking(req.params.id, req.user.id);
  res.json({ success: true, data: order });
});

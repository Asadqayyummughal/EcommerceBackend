import { Request, Response } from "express";
import * as orderService from "../services/order.service";
export const checkout = async (req: Request, res: Response) => {
  const order = await orderService.checkoutOreder(req.user.id, req.body);
  res.status(201).json(order);
};
export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.user, req.params.id);
  res.json(order);
};

export const cancelOrder = async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(req.user.id, req.params.id);
  res.json({ message: "Order cancelled", order });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.json(order);
};

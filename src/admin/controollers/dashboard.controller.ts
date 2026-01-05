import * as dashboardService from "../services/dashboard.service";
import { Request, Response } from "express";

export const getDashboardStats = async (req: Request, res: Response) => {
  const [sales, orderStatus, topProducts, lowStock] = await Promise.all([
    dashboardService.salesOverview(),
    dashboardService.ordersByStatus(),
    dashboardService.topSellingProducts(),
    dashboardService.lowStockProducts(),
  ]);

  res.json({
    sales,
    orderStatus,
    topProducts,
    lowStock,
  });
};

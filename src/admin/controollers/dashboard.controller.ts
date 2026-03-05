import * as dashboardService from "../services/dashboard.service";
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [sales, orderStatus, topProducts, lowStock] = await Promise.all([
    dashboardService.salesOverview(),
    dashboardService.ordersByStatus(),
    dashboardService.topSellingProducts(),
    dashboardService.lowStockProducts(),
  ]);

  res.json({
    success: true,
    data: { sales, orderStatus, topProducts, lowStock },
  });
});

import path from "path";
import { Request, Response } from "express";
import * as storeService from "../services/store.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createStore = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const logo = files?.logo?.[0]
    ? path.relative(process.cwd(), files.logo[0].path).replace(/\\/g, "/")
    : undefined;
  const banner = files?.banner?.[0]
    ? path.relative(process.cwd(), files.banner[0].path).replace(/\\/g, "/")
    : undefined;
  const store = await storeService.createStore(
    req.user.id,
    req.body,
    logo,
    banner,
  );
  res
    .status(201)
    .json({ success: true, message: "Store created", data: store });
});

export const approveStore = asyncHandler(
  async (req: Request, res: Response) => {
    const store = await storeService.approveStore(
      req.params.id,
      req.body.status,
    );
    res.json({ success: true, message: "Store status updated", data: store });
  },
);

export const listStores = asyncHandler(async (_req: Request, res: Response) => {
  const stores = await storeService.listAllStores();
  res.json({ success: true, data: stores });
});

export const getStoreByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const store = await storeService.getStoreByUserId(req.user.id);
    res.json({ success: true, data: store });
  },
);

export const updateStore = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const logo = files?.logo?.[0]
    ? path.relative(process.cwd(), files.logo[0].path).replace(/\\/g, "/")
    : undefined;
  const banner = files?.banner?.[0]
    ? path.relative(process.cwd(), files.banner[0].path).replace(/\\/g, "/")
    : undefined;
  const store = await storeService.updateStore(
    req.user.id,
    req.params.id,
    req.body,
    logo,
    banner,
  );
  res.json({ success: true, message: "Store updated", data: store });
});

export const getStoreAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const analytics = await storeService.getStoreAnalytics(req.params.id);
    res.json({ success: true, data: analytics });
  },
);

export const listStoreProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const products = await storeService.listStoreProducts(req.params.id);
    res.json({ success: true, data: products });
  },
);

export const listStoreOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const orders = await storeService.getOrdersByVendorWithAggregation(
      req.params.vendorId,
    );
    res.json({ success: true, data: orders });
  },
);

import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { toObjectId } from "../utils/helpers.utils";
import { asyncHandler } from "../utils/asyncHandler";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const images =
    (req.files as Express.Multer.File[] | undefined)?.map(
      (f) => `uploads/products/${f.filename}`,
    ) || [];
  const payload: any = { ...req.body, images };
  payload.createdBy = toObjectId(req.user.id);
  const product = await productService.createProductService(payload);
  res.status(201).json({ success: true, message: "Product created", data: product });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductByIdService(req.params.id);
  res.json({ success: true, data: product });
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const opts = {
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 20),
    q: req.query.q as string | undefined,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    category: req.query.category as string | undefined,
    subCategory: req.query.subCategory as string | undefined,
    tags: req.query.tags ? String(req.query.tags).split(",") : undefined,
    sort: req.query.sort as string | undefined,
    isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
  };
  const result = await productService.listProductsService(opts);
  res.json({ success: true, data: result });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const images = (req.files as Express.Multer.File[] | undefined)?.map(
    (f) => `uploads/products/${f.filename}`,
  );
  const payload: any = { ...req.body };
  if (images && images.length) payload.images = images;
  const product = await productService.updateProductService(req.params.id, payload);
  res.json({ success: true, message: "Product updated", data: product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProductService(req.params.id);
  res.json({ success: true, message: "Product deleted" });
});

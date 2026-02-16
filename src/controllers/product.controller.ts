import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { toObjectId } from "../utils/helpers.utils";

export const createProduct = async (req: Request, res: Response) => {
  try {
    // images uploaded via multer -> req.files
    const images =
      (req.files as Express.Multer.File[] | undefined)?.map(
        (f) => `/uploads/products/${f.filename}`,
      ) || [];
    const payload = { ...req.body, images };
    payload.createdBy = toObjectId(req.user.id);
    const product = await productService.createProductService(payload as any);
    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const product = await productService.getProductByIdService(id);
    return res.json({ success: true, product });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const opts = {
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      q: req.query.q as string | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      categories: req.query.categories
        ? String(req.query.categories).split(",")
        : undefined,
      tags: req.query.tags ? String(req.query.tags).split(",") : undefined,
      sort: req.query.sort as string | undefined,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
    };
    const result = await productService.listProductsService(opts);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const images = (req.files as Express.Multer.File[] | undefined)?.map(
      (f) => `/uploads/products/${f.filename}`,
    );
    const payload = { ...req.body } as any;
    if (images && images.length) payload.images = images;
    const product = await productService.updateProductService(id, payload);
    return res.json({ success: true, product });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await productService.deleteProductService(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

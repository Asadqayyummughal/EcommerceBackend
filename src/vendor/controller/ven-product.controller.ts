import { Request, Response } from "express";
import * as ProductService from "../services/ven-product.service";
import { toObjectId } from "../../utils/helpers.utils";
import { asyncHandler } from "../../utils/asyncHandler";

export const createVendorProduct = asyncHandler(async (req: Request, res: Response) => {
  const images =
    (req.files as Express.Multer.File[] | undefined)?.map(
      (f) => `uploads/products/${f.filename}`,
    ) || [];
  const payload: any = { ...req.body, images };
  payload.createdBy = toObjectId(req.user.id);
  const product = await ProductService.createVendorProduct(req.user.id, payload);
  res.status(201).json({ success: true, message: "Product created", data: product });
});

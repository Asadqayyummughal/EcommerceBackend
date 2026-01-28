import { Request, Response } from "express";
import * as ProductService from "../services/ven-product.service";
import { toObjectId } from "../../utils/helpers.utils";

export const createVendorProduct = async (req: Request, res: Response) => {
  try {
    const images =
      (req.files as Express.Multer.File[] | undefined)?.map(
        (f) => `/uploads/products/${f.filename}`,
      ) || [];
    const payload = { ...req.body, images };
    payload.createdBy = toObjectId(req.user.id);
    let product = await ProductService.createVendorProduct(
      req.user.id,
      payload,
    );
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: true,
      error: Error.message,
    });
  }
};

export const getVendorProduct = async (req: Request, res: Response) => {
  try {
    let products = await ProductService.createVendorProduct(
      req.user.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (Error: any) {
    res.status(400).json({
      success: true,
      error: Error.message,
    });
  }
};

// export const updateVendorProduct = async (req: Request, res: Response) => {
//   try {
//     let productId = req.params.id;
//     let product = await ProductService.createVendorProduct(
//       productId,
//       req.user.id,
//       req.body,
//     );
//     res.status(201).json({
//       success: true,
//       data: product,
//     });
//   } catch (Error: any) {
//     res.status(400).json({
//       success: true,
//       error: Error.message,
//     });
//   }
// };

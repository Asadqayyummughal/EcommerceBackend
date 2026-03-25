import { Request, Response } from "express";
import * as subCategoryService from "../services/subcatrgory.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createSubCategory = asyncHandler(async (req: Request, res: Response) => {
  const image = req.file ? `uploads/categories/${req.file.filename}` : null;
  const sub = await subCategoryService.createSubCategoryService({ ...req.body, image });
  res.status(201).json({ success: true, message: "Subcategory created successfully", data: sub });
});

export const listSubCategories = asyncHandler(async (_req: Request, res: Response) => {
  const list = await subCategoryService.listSubCategoriesService();
  res.json({ success: true, data: list });
});

export const getSubCategory = asyncHandler(async (req: Request, res: Response) => {
  const sub = await subCategoryService.getSubCategoryByIdService(req.params.id);
  res.json({ success: true, data: sub });
});

export const updateSubCategory = asyncHandler(async (req: Request, res: Response) => {
  const image = req.file ? `uploads/categories/${req.file.filename}` : null;
  const updateData: any = { ...req.body };
  if (image) updateData.image = image;
  const updated = await subCategoryService.updateSubCategoryService(req.params.id, updateData);
  res.json({ success: true, message: "Subcategory updated successfully", data: updated });
});

export const deleteSubCategory = asyncHandler(async (req: Request, res: Response) => {
  await subCategoryService.deleteSubCategoryService(req.params.id);
  res.json({ success: true, message: "Subcategory deleted successfully" });
});

// GET /api/product/subcategories/:id/children  — direct children of a subcategory
// GET /api/product/subcategories/root?category=<categoryId>  — level-1 subs of a category
export const getSubCategoryChildren = asyncHandler(async (req: Request, res: Response) => {
  const parentId = req.params.id === "root" ? null : req.params.id;
  const categoryId = req.query.category as string | undefined;
  const children = await subCategoryService.getSubCategoryChildrenService(parentId, categoryId);
  res.json({ success: true, data: children });
});

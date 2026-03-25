import { Request, Response } from "express";
import * as categoryService from "../services/category.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const image = req.file ? `uploads/categories/${req.file.filename}` : null;
  const category = await categoryService.createCategoryService({ ...req.body, image });
  res.status(201).json({ success: true, message: "Category created successfully", data: category });
});

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategoriesService();
  res.json({ success: true, data: categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryByIdService(req.params.id);
  res.json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const image = req.file ? `uploads/categories/${req.file.filename}` : null;
  const updateData: any = { ...req.body };
  if (image) updateData.image = image;
  const updated = await categoryService.updateCategoryService(req.params.id, updateData);
  res.json({ success: true, message: "Category updated successfully", data: updated });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategoryService(req.params.id);
  res.json({ success: true, message: "Category deleted successfully" });
});

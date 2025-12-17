import { Request, Response } from "express";
import * as categoryService from "../services/category.service";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const image = req.file ? req.file.path : null;

    const category = await categoryService.createCategoryService({
      ...req.body,
      image,
    });

    return res.json({ message: "Category created successfully", category });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.listCategoriesService();
    return res.json(categories);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryByIdService(
      req.params.id
    );
    return res.json(category);
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const image = req.file ? req.file.path : null;

    const updateData = { ...req.body };
    if (image) updateData.image = image;

    const updated = await categoryService.updateCategoryService(
      req.params.id,
      updateData
    );

    return res.json({ message: "Category updated successfully", updated });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategoryService(req.params.id);
    return res.json({ message: "Category deleted successfully" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

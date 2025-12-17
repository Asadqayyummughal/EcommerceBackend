import { Request, Response } from "express";
import * as subCategoryService from "../services/subcatrgory.service";

export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const image = req.file ? req.file.path : null;

    const sub = await subCategoryService.createSubCategoryService({
      ...req.body,
      image,
    });

    return res.json({ message: "Subcategory created successfully", sub });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const listSubCategories = async (req: Request, res: Response) => {
  try {
    const list = await subCategoryService.listSubCategoriesService();
    return res.json(list);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getSubCategory = async (req: Request, res: Response) => {
  try {
    const sub = await subCategoryService.getSubCategoryByIdService(
      req.params.id
    );
    return res.json(sub);
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
};

export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const image = req.file ? req.file.path : null;
    const updateData = { ...req.body };
    if (image) updateData.image = image;

    const updated = await subCategoryService.updateSubCategoryService(
      req.params.id,
      updateData
    );

    return res.json({ message: "Subcategory updated successfully", updated });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    await subCategoryService.deleteSubCategoryService(req.params.id);
    return res.json({ message: "Subcategory deleted successfully" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

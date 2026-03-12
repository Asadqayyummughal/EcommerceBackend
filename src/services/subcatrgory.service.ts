import SubCategory from "../models/subcategory.model";
import Category from "../models/category.model";
import { AppError } from "../utils/AppError";

export const createSubCategoryService = async (data: any) => {
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) throw new AppError("Parent category not found", 404);

  return await SubCategory.create(data);
};

export const listSubCategoriesService = async () => {
  return await SubCategory.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
};

export const getSubCategoryByIdService = async (id: string) => {
  const sub = await SubCategory.findById(id).populate("category", "name slug");
  if (!sub) throw new AppError("Subcategory not found", 404);
  return sub;
};

export const updateSubCategoryService = async (id: string, data: any) => {
  if (data.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) throw new AppError("Parent category not found", 404);
  }

  const updated = await SubCategory.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new AppError("Subcategory not found", 404);
  return updated;
};

export const deleteSubCategoryService = async (id: string) => {
  const deleted = await SubCategory.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Subcategory not found", 404);
  return deleted;
};

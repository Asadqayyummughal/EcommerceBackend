import Category from "../models/category.model";
import SubCategory from "../models/subcategory.model";
import { AppError } from "../utils/AppError";

export const createCategoryService = async (data: any) => {
  return await Category.create(data);
};

export const listCategoriesService = async () => {
  return await Category.find().sort({ createdAt: -1 });
};

export const getCategoryByIdService = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

export const updateCategoryService = async (id: string, data: any) => {
  const updated = await Category.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new AppError("Category not found", 404);
  return updated;
};

export const deleteCategoryService = async (id: string) => {
  const hasSubCategories = await SubCategory.findOne({ category: id });
  if (hasSubCategories) {
    throw new AppError("Cannot delete category with existing subcategories", 400);
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Category not found", 404);
  return deleted;
};

import SubCategory from "../models/subcategory.model";
import Category from "../models/category.model";

export const createSubCategoryService = async (data: any) => {
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) throw new Error("Parent category not found");

  return await SubCategory.create(data);
};

export const listSubCategoriesService = async () => {
  return await SubCategory.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
};

export const getSubCategoryByIdService = async (id: string) => {
  const sub = await SubCategory.findById(id).populate("category", "name slug");
  if (!sub) throw new Error("Subcategory not found");
  return sub;
};

export const updateSubCategoryService = async (id: string, data: any) => {
  if (data.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) throw new Error("Parent category not found");
  }

  const updated = await SubCategory.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error("Subcategory not found");
  return updated;
};

export const deleteSubCategoryService = async (id: string) => {
  const deleted = await SubCategory.findByIdAndDelete(id);
  if (!deleted) throw new Error("Subcategory not found");
  return deleted;
};

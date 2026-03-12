import SubCategory from "../models/subcategory.model";
import Category from "../models/category.model";
import { AppError } from "../utils/AppError";

export const createSubCategoryService = async (data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  category?: string;  // required only for level-1
  parent?: string;    // required for level 2–4
  isActive?: boolean;
}) => {
  // Level 1: no parent, category is provided directly
  if (!data.parent) {
    if (!data.category) throw new AppError("category is required for a top-level subcategory", 400);
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) throw new AppError("Parent category not found", 404);

    return SubCategory.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      isActive: data.isActive,
      category: data.category,
      ancestors: [],
      level: 1,
    });
  }

  // Level 2–4: parent is another SubCategory
  const parentSub = await SubCategory.findById(data.parent);
  if (!parentSub) throw new AppError("Parent subcategory not found", 404);
  if (parentSub.level >= 4) throw new AppError("Maximum subcategory depth is 4", 400);

  return SubCategory.create({
    name: data.name,
    slug: data.slug,
    description: data.description,
    image: data.image,
    isActive: data.isActive,
    category: parentSub.category,           // inherit root category
    parent: parentSub._id,
    ancestors: [...parentSub.ancestors, parentSub._id], // full path to parent
    level: parentSub.level + 1,
  });
};

export const listSubCategoriesService = async () => {
  return SubCategory.find()
    .populate("category", "name slug")
    .populate("parent", "name slug")
    .sort({ level: 1, createdAt: -1 });
};

// Returns a subcategory + its full ancestor chain populated
export const getSubCategoryByIdService = async (id: string) => {
  const sub = await SubCategory.findById(id)
    .populate("category", "name slug")
    .populate("parent", "name slug")
    .populate("ancestors", "name slug level");
  if (!sub) throw new AppError("Subcategory not found", 404);
  return sub;
};

// Returns all direct children of a subcategory (or all level-1 subs of a category)
export const getSubCategoryChildrenService = async (
  parentId: string | null,
  categoryId?: string,
) => {
  const filter: any = { parent: parentId ?? null };
  if (categoryId) filter.category = categoryId;
  return SubCategory.find(filter)
    .populate("category", "name slug")
    .sort({ name: 1 });
};

export const updateSubCategoryService = async (id: string, data: any) => {
  // Prevent changing parent/level/ancestors/category after creation — use dedicated logic if re-parenting is needed
  const { parent, ancestors, level, category, ...safeData } = data;
  const updated = await SubCategory.findByIdAndUpdate(id, safeData, { new: true });
  if (!updated) throw new AppError("Subcategory not found", 404);
  return updated;
};

export const deleteSubCategoryService = async (id: string) => {
  // Block deletion if it has children
  const hasChildren = await SubCategory.findOne({ parent: id });
  if (hasChildren) throw new AppError("Cannot delete a subcategory that has children", 400);

  const deleted = await SubCategory.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Subcategory not found", 404);
  return deleted;
};

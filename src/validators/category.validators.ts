import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2),
  slug: Joi.string(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const createSubCategorySchema = Joi.object({
  name: Joi.string().min(2),
  slug: Joi.string(),
  category: Joi.string().min(24), // must be valid ObjectId length
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

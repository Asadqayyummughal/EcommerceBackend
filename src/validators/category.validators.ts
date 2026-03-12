import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2),
  slug: Joi.string(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const createSubCategorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  slug: Joi.string().required(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  // Either category (level-1) or parent (level 2-4) must be provided
  category: Joi.string().hex().length(24).when("parent", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  parent: Joi.string().hex().length(24).optional(),
});

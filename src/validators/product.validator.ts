import Joi from "joi";

export const createProductSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  slug: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow("", null),
  shortDescription: Joi.string().allow("", null),
  price: Joi.number().positive().required(),
  salePrice: Joi.number().positive().allow(null),
  currency: Joi.string().length(3).default("USD"),
  sku: Joi.string().allow("", null),
  brand: Joi.string().allow("", null),
  categories: Joi.array().items(Joi.string().hex().length(24)).default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
  variants: Joi.array()
    .items(
      Joi.object({
        sku: Joi.string().allow(""),
        attributes: Joi.object().pattern(Joi.string(), Joi.string()),
        price: Joi.number().positive(),
        stock: Joi.number().integer().min(0),
        images: Joi.array().items(Joi.string().uri()),
      })
    )
    .default([]),
  stock: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const updateProductSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  slug: Joi.string().min(3).max(200),
  description: Joi.string().allow("", null),
  shortDescription: Joi.string().allow("", null),
  price: Joi.number().positive(),
  salePrice: Joi.number().positive().allow(null),
  currency: Joi.string().length(3),
  sku: Joi.string().allow("", null),
  brand: Joi.string().allow("", null),
  categories: Joi.array().items(Joi.string().hex().length(24)),
  tags: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string().uri()),
  variants: Joi.array().items(
    Joi.object({
      sku: Joi.string().allow(""),
      attributes: Joi.object().pattern(Joi.string(), Joi.string()),
      price: Joi.number().positive(),
      stock: Joi.number().integer().min(0),
      images: Joi.array().items(Joi.string().uri()),
    })
  ),
  stock: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
});

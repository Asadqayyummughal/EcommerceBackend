import Joi from "joi";

export const syncCartSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().min(24).required().messages({
          "string.base": "Product ID must be a string",
          "string.min":
            "Product ID must be at least {#limit} characters long (likely a MongoDB ObjectId)",
          "any.required": "Product ID is required for each cart item",
        }),
        variantSku: Joi.string().optional().messages({
          "string.base": "Variant SKU must be a string if provided",
        }),
        quantity: Joi.number().min(1).required().messages({
          "number.base": "Quantity must be a number",
          "number.min": "Quantity must be at least {#limit}",
          "any.required": "Quantity is required for each cart item",
        }),
      })
    )
    .required()
    .min(1) // Optional: ensure at least one item if that fits your logic
    .messages({
      "array.base": "Items must be an array",
      "any.required": "Items array is required",
      "array.min": "Cart must contain at least one item",
    }),
});

export const addToCartSchema = Joi.object({
  productId: Joi.string().min(24).trim().required().messages({
    "any.required": "Product ID is required",
    "string.base": "Product ID must be a string",
    "string.min":
      "Product ID must be at least {#limit} characters long (likely a MongoDB ObjectId)",
    "string.empty": "Product ID cannot be empty",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required",
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least {#limit}",
  }),

  variantSku: Joi.string().trim().optional().allow("").messages({
    "string.base": "Variant SKU must be a string if provided",
  }),
});

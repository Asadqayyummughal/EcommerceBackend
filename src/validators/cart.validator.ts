import Joi from "joi";

export const syncCartSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().min(24).required(),
        variantSku: Joi.string().optional(),
        quantity: Joi.number().min(1).required(),
      })
    )
    .required(),
});

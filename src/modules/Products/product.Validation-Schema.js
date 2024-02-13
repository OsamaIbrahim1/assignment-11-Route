import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addProductSchema = {
  body: Joi.object({
    title: Joi.string().trim().required(),
    desc: Joi.string(),
    slug: Joi.string().required(),
    basePrice: Joi.number().required(),
    discount: Joi.number().default(0),
    appliedPrice: Joi.number().required(),
    stock: Joi.number().min(0).default(0).required(),
    specs: Joi.array().items(
      Joi.array().length(2).ordered(
        Joi.string(), // Key
        Joi.string().alphanum() // Value
      )
    ),
  }),
  query: Joi.object({
    categoryId: generalRules.dbId,
    subCategoryId: generalRules.dbId,
    brandId: generalRules.dbId,
  }),
  headers: generalRules.headersRules,
};

export const updateProductSchema = {
  body: Joi.object({
    title: Joi.string().trim(),
    desc: Joi.string(),
    slug: Joi.string(),
    basePrice: Joi.number(),
    discount: Joi.number(),
    appliedPrice: Joi.number(),
    stock: Joi.number().min(0),
    specs: Joi.array().items(
      Joi.array().length(2).ordered(
        Joi.string(), // Key
        Joi.string().alphanum() // Value
      )
    ),
  }),
  query: Joi.object({
    productId: generalRules.dbId,
  }),
  headers: generalRules.headersRules,
};

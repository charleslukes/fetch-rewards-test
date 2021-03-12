import Joi from "joi";

export const addPayerTransactionSchema = Joi.object({
  payer: Joi.string().required(),
  points: Joi.number().required(),
  timestamp: Joi.date().required(),
});

export const spendPointsSchema = Joi.object({
  points: Joi.number().required(),
});

import Joi from "joi";

export const createContactSchema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().min(3).max(20),
});

export const updateContactSchema = Joi.object({
    name: Joi.string().min(3).max(20),
     phoneNumber: Joi.string().min(3).max(20),
    email: Joi.string().email().min(3).max(20),
}).min(1);
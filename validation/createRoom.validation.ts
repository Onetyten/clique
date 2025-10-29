import Joi from "joi";

const cliqueCreateSchema = Joi.object({
  cliqueKey: Joi.string().empty("").min(3).messages({
    "string.base": "Key must be a string",
    "string.empty": "Key is required",
    "string.min": "Key must be at least 3 characters long",
    "any.required": "Key must be provided"
  }),
  cliqueName: Joi.string().empty("").min(3).max(50).messages({
    "string.base": "Clique name must be a string",
    "string.empty": "Clique name is required",
    "string.min": "Clique name must be at least 3 characters long",
    "string.max": "Clique name must not exceed 50 characters",
  }),
  username: Joi.string().empty("").min(2).max(30).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 2 characters long",
    "string.max": "Username must not exceed 30 characters",
    "any.required": "Username must be provided"
  })
}).options({ abortEarly: false });

export default cliqueCreateSchema ;

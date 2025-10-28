import Joi from "joi";

const userJoinSchema = Joi.object({
  cliqueKey: Joi.string().min(3).max(50).required().messages({
      "string.base": "Key must be a string.",
      "string.empty": "Key is required.",
      "string.min": "Key must be at least 3 characters long.",
      "string.max": "Key must not exceed 50 characters.",
      "any.required": "Key must be provided."
    }),

  isFirstConn: Joi.boolean().optional().messages({
      "boolean.base": "isFirstConn must be a boolean value."
    }),

  username: Joi.string().min(2).max(30).required().messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username is required.",
      "string.min": "Username must be at least 2 characters long.",
      "string.max": "Username must not exceed 30 characters.",
      "any.required": "Username must be provided."
    })
}).options({ abortEarly: false });

export default userJoinSchema;

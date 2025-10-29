import Joi from "joi";

const userRejoinSchema = Joi.object({
  cliqueName: Joi.string().empty("").min(3).max(50).messages({
    "string.base": "Clique name must be a string",
    "string.empty": "Clique name is required",
    "string.min": "Clique name must be at least 3 characters long",
    "string.max": "Clique name must not exceed 50 characters",
  }),
  username: Joi.string().min(2).max(30).required().messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username is required.",
      "string.min": "Username must be at least 2 characters long.",
      "string.max": "Username must not exceed 30 characters.",
      "any.required": "Username must be provided."
    }),
  token: Joi.string().required().messages({
    "string.base": "Error reconnecting.",
    "string.empty": "Error reconnecting.",
    "any.required": "Error reconnecting."
  }),
}).options({ abortEarly: false });

export default userRejoinSchema;

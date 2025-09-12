import Joi from "joi";

const cliqueCreateSchema = Joi.object({
  cliqueKey: Joi.string().min(3).max(50).messages({"string.empty": "key is required", "any.required": "Key must be provided"}),
  cliqueName: Joi.string().min(3).max(50).messages({"string.empty": "CliqueName is required"}),
  username: Joi.string().min(2).max(30).required().messages({"string.empty": "Username is required","any.required": "Username must be provided"})
}).options({ abortEarly: false });

export default cliqueCreateSchema ;

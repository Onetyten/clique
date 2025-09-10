import Joi from "joi";

const userJoinSchema = Joi.object({
    username: Joi.string().min(3).max(64).required(),
    roomIndex: Joi.number().integer().positive().required()
}).options({abortEarly:false})

export default userJoinSchema
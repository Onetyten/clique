import Joi from "joi";

const sessionSchema = Joi.object({
    currentSession:{
        id:Joi.string().guid({version:'uuidv4'}).required(),
        is_active:Joi.boolean().required(),
        room_id:Joi.string().guid({version:'uuidv4'}).required(),
        gm_id:Joi.string().guid({version:'uuidv4'}).required(),
        question:Joi.string().required(),
        answer:Joi.string().required(),
        end_time:Joi.number().integer().required(),
    },
    user:{
        id: Joi.string().guid({version:'uuidv4'}).required(),
        name: Joi.string().required(),
        role: Joi.number().integer().required(),
        room_id: Joi.string().guid({version:'uuidv4'}).required(),
        hex_code:Joi.string().optional(),
        joined_at: Joi.date().optional(),
        score: Joi.number().integer().optional(),
        was_gm: Joi.boolean()
    }
})

export default sessionSchema
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const sessionSchema = joi_1.default.object({
    currentSession: {
        id: joi_1.default.string().guid({ version: 'uuidv4' }).required(),
        is_active: joi_1.default.boolean().required(),
        room_id: joi_1.default.string().guid({ version: 'uuidv4' }).required(),
        gm_id: joi_1.default.string().guid({ version: 'uuidv4' }).required(),
        question: joi_1.default.string().required(),
        answer: joi_1.default.string().required(),
        end_time: joi_1.default.number().integer().required(),
    },
    isAnswer: joi_1.default.boolean(),
    user: {
        id: joi_1.default.string().guid({ version: 'uuidv4' }).required(),
        name: joi_1.default.string().required(),
        role: joi_1.default.number().integer().required(),
        room_id: joi_1.default.string().guid({ version: 'uuidv4' }).required(),
        color_id: joi_1.default.number().integer().optional(),
        joined_at: joi_1.default.date().optional(),
        color_hex: joi_1.default.string().optional(),
        score: joi_1.default.number().integer().optional(),
        was_gm: joi_1.default.boolean()
    }
});
exports.default = sessionSchema;

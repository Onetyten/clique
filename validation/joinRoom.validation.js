"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const userJoinSchema = joi_1.default.object({
    cliqueKey: joi_1.default.string().min(3).max(50).messages({ "string.empty": "key is required", "any.required": "key must be provided" }),
    isFirstConn: joi_1.default.boolean().optional(),
    username: joi_1.default.string().min(2).max(30).required().messages({ "string.empty": "Username is required", "any.required": "Username must be provided" })
}).options({ abortEarly: false });
exports.default = userJoinSchema;

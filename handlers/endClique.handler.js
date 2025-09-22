"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scorchedEarth = scorchedEarth;
const pgConnect_1 = __importDefault(require("../config/pgConnect"));
function scorchedEarth(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield pgConnect_1.default.query('DElETE FROM sessions WHERE room_id = $1', [roomId]);
            yield pgConnect_1.default.query('DElETE FROM members WHERE room_id = $1', [roomId]);
            yield pgConnect_1.default.query('DElETE FROM rooms WHERE id = $1', [roomId]);
            console.log(`Room ${roomId} cleaned up from the Database`);
        }
        catch (error) {
            console.error("Cleanup failed:", error);
        }
    });
}

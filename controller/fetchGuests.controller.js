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
exports.fetchGuests = fetchGuests;
const joi_1 = __importDefault(require("joi"));
const pgConnect_1 = __importDefault(require("../config/pgConnect"));
const getGuestSchema = joi_1.default.object({
    roomName: joi_1.default.string().min(3).max(50).required()
}).options({ abortEarly: false });
function fetchGuests(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("member fetch acknowledged");
        const { error, value } = getGuestSchema.validate(req.params);
        if (error) {
            console.error("validation failed", error.details);
            return res.status(400).json({ message: 'Invalid clique number provided', error: error.details.map(detail => detail.message) });
        }
        console.log("Room name from params:", req.params.roomName);
        const { roomName } = value;
        try {
            const memberTable = yield pgConnect_1.default.query('SELECT m.*,c.hexcode AS color_hex FROM members m INNER JOIN rooms r ON m.room_id = r.id LEFT JOIN colors c ON m.color_id = c.id WHERE r.name = $1', [roomName]);
            if (memberTable.rows.length == 0) {
                console.log('There is no one in this clique');
                return res.status(404).json({ message: 'There is no one in this clique' });
            }
            return res.status(200).json({ message: `members of clique ${roomName} fetched successfully`, members: memberTable.rows });
        }
        catch (error) {
            console.error(`Failed to get ${roomName} members`, error);
            return res.status(500).json({ message: "Failed to get clique members due to a server error.", error: error instanceof Error ? error.message : 'internal server error', success: false });
        }
    });
}

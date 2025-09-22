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
exports.handleAskQuestion = handleAskQuestion;
const pgConnect_1 = __importDefault(require("../config/pgConnect"));
const redisConfig_1 = __importDefault(require("../config/redisConfig"));
function handleAskQuestion(socket_1, _a) {
    return __awaiter(this, arguments, void 0, function* (socket, { user, question, answer, endTime }) {
        const gameRoom = yield pgConnect_1.default.query(`SELECT * FROM members WHERE room_id=$1`, [user.room_id]);
        if (gameRoom.rows.length <= 2)
            return socket.emit("questionError", { message: "There must be more that two players to start a game session" });
        yield pgConnect_1.default.query('UPDATE sessions SET is_active = false WHERE room_id = $1', [user.room_id]);
        let adminId = yield redisConfig_1.default.get('adminId');
        if (!adminId) {
            const adminRoleResult = yield pgConnect_1.default.query('SELECT id FROM roles WHERE name=$1', ['admin']);
            if (adminRoleResult.rows.length > 0) {
                yield redisConfig_1.default.set('adminId', adminRoleResult.rows[0].id);
                console.log('Cached adminId in Redis');
            }
            else {
                socket.emit("questionError", { message: "Server error" });
                throw new Error("Admin role not found in roles table");
            }
            adminId = adminRoleResult.rows[0].id;
        }
        if (user.role.toString() !== adminId)
            return socket.emit("questionError", { message: "Only Game masters can ask questions" });
        const session = yield pgConnect_1.default.query('INSERT INTO sessions (is_active,room_id,gm_id,question,answer,end_time) values ($1,$2,$3,$4,$5,$6) RETURNING *', [true, user.room_id, user.id, question, answer, endTime]);
        yield pgConnect_1.default.query("UPDATE members SET was_gm = true WHERE id =$1", [user.id]);
        const numberOfSession = yield pgConnect_1.default.query('SELECT COUNT (*) FROM sessions WHERE room_id = $1', [user.room_id]);
        const roundNum = parseInt(numberOfSession.rows[0].count, 10);
        socket.to(user.room_id).emit("questionAsked", { session: session.rows[0] });
        return socket.emit("questionSuccess", { message: "Your question has been asked successfully!", session: session.rows[0], roundNum });
    });
}

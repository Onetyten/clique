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
exports.handleSessionOver = handleSessionOver;
const endSessionSchema_1 = __importDefault(require("../validation/endSessionSchema"));
const pgConnect_1 = __importDefault(require("../config/pgConnect"));
const redisConfig_1 = __importDefault(require("../config/redisConfig"));
function handleSessionOver(io_1, socket_1, _a) {
    return __awaiter(this, arguments, void 0, function* (io, socket, { currentSession, user, isAnswer }) {
        const { error } = endSessionSchema_1.default.validate({ currentSession, user, isAnswer });
        if (error) {
            console.error("validation failed", error.details);
            return socket.emit("Error", { message: 'Invalid input' });
        }
        try {
            const ongoingSessions = yield pgConnect_1.default.query('SELECT id FROM sessions WHERE room_id = $1 and is_active = true', [currentSession.room_id]);
            if (ongoingSessions.rows.length == 0) {
                return;
            }
            yield pgConnect_1.default.query(`UPDATE sessions SET is_active=false WHERE id = $1`, [currentSession.id]);
            const addedScore = 10;
            const guestID = parseInt((yield redisConfig_1.default.get('guestId')) || "1", 10);
            const adminId = parseInt((yield redisConfig_1.default.get('adminId')) || "2", 10);
            console.log("adminId", adminId, typeof adminId);
            console.log("guestID", guestID, typeof guestID);
            yield pgConnect_1.default.query(`UPDATE members SET role = $1 WHERE id = $2`, [guestID, currentSession.gm_id]);
            console.log("oldGm id", currentSession.gm_id);
            let newGMTable = yield pgConnect_1.default.query('SELECT * FROM members WHERE room_id = $1 AND was_gm IS false ORDER  BY RANDOM () LIMIT 1', [currentSession.room_id]);
            if (newGMTable.rows.length == 0) {
                yield pgConnect_1.default.query('UPDATE members SET was_gm = false WHERE room_id = $1', [currentSession.room_id]);
                newGMTable = yield pgConnect_1.default.query('SELECT * FROM members WHERE room_id = $1 AND was_gm IS false ORDER  BY RANDOM () LIMIT 1', [currentSession.room_id]);
                if (newGMTable.rows.length == 0) {
                    return socket.emit("Error", { message: "No members found in the room." });
                }
            }
            const numberOfSession = yield pgConnect_1.default.query('SELECT COUNT (*) FROM sessions WHERE room_id = $1', [currentSession.room_id]);
            const totalSessions = parseInt(numberOfSession.rows[0].count, 10);
            const roundNum = totalSessions + 1;
            const newGM = newGMTable.rows[0];
            console.log("newGM", newGM);
            yield pgConnect_1.default.query(`UPDATE members 
            SET role = CASE WHEN id = $1 THEN $2::smallint ELSE $3::smallint END,
                was_gm = CASE WHEN id = $1 THEN true ELSE was_gm END
            WHERE room_id = $4`, [newGM.id, adminId, guestID, currentSession.room_id]);
            if (isAnswer == true) {
                console.log("answer correct session over");
                yield pgConnect_1.default.query('UPDATE members SET score = score + $1 WHERE id=$2', [addedScore, user.id]);
                return io.to(currentSession.room_id).emit("answerCorrect", { message: `Correct, ${addedScore} points to ${user.name}`, adminMessage: `The new Game Master is ${newGM.name}`, correctUser: user, session: currentSession, roundNum });
            }
            console.log("timed out session over");
            return io.to(currentSession.room_id).emit("timeoutHandled", { adminMessage: `The new Game Master is ${newGM.name}`, session: currentSession, roundNum });
        }
        catch (error) {
            console.log(error);
            return socket.emit("Error", { message: "Internal server error" });
        }
    });
}

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
exports.handleJoinClique = handleJoinClique;
const pgConnect_1 = __importDefault(require("../config/pgConnect"));
const joinRoom_validation_1 = __importDefault(require("../validation/joinRoom.validation"));
const redisConfig_1 = __importDefault(require("../config/redisConfig"));
function handleJoinClique(socket_1, _a, socketUserMap_1) {
    return __awaiter(this, arguments, void 0, function* (socket, { cliqueKey, username, isFirstConn }, socketUserMap) {
        const { error } = joinRoom_validation_1.default.validate({ cliqueKey, username, isFirstConn });
        if (error) {
            console.error("validation failed", error.details);
            return socket.emit("Error", {
                message: 'Invalid input'
            });
        }
        console.log(`request from ${username} to join clique acknowledged`);
        const name = username.toLowerCase();
        let adminId = parseInt((yield redisConfig_1.default.get('adminId')) || "2", 10);
        let guestId = parseInt((yield redisConfig_1.default.get('guestId')) || "1", 10);
        try {
            const roomExists = yield pgConnect_1.default.query('SELECT * FROM rooms WHERE clique_key = $1', [cliqueKey]);
            if (roomExists.rows.length === 0) {
                console.log('This room does not exist');
                return socket.emit("Error", { message: "This clique does not exist" });
            }
            const roomName = roomExists.rows[0].name;
            const roomId = roomExists.rows[0].id;
            let newUser;
            let colorId = 1;
            if (isFirstConn) {
                const nameExists = yield pgConnect_1.default.query('SELECT name FROM members WHERE name = $1 AND room_id = $2', [name, roomId]);
                if (nameExists.rows.length > 0) {
                    console.log(`sorry, user ${name} already exists in this clique, please choose another name`);
                    return socket.emit("Error", { message: `user ${name} already exists in this clique choose another name` });
                }
                const isSessionActive = yield pgConnect_1.default.query('SELECT is_active,end_time FROM sessions WHERE room_id=$1 AND is_active IS true', [roomId]);
                if (isSessionActive.rows.length > 0) {
                    const timeLeft = Math.floor((isSessionActive.rows[0].end_time - Date.now()) / 1000);
                    return socket.emit("midSessionError", { message: `A session is currently going on in room ${roomName}, rejoin in ${timeLeft}s`, timeLeft });
                }
                if (!guestId) {
                    const guestRoleResult = yield pgConnect_1.default.query('SELECT id FROM roles WHERE name=$1', ['guest']);
                    if (guestRoleResult.rows.length > 0) {
                        yield redisConfig_1.default.set("guestId", guestRoleResult.rows[0].id);
                        console.log('Cached guestId in Redis');
                    }
                    else {
                        socket.emit("Error", { message: 'Internal server error' });
                        throw new Error("Guest role not found in roles table");
                    }
                    guestId = guestRoleResult.rows[0].id;
                }
                const colorResult = yield pgConnect_1.default.query(`SELECT id FROM colors ORDER BY random() LIMIT 1`);
                colorId = colorResult.rows[0].id;
                const newUserResult = yield pgConnect_1.default.query('INSERT INTO members (name, room_id, role, color_id) VALUES($1,$2,$3,$4) RETURNING *', [name, roomId, guestId, colorId]);
                newUser = newUserResult.rows[0];
            }
            else {
                const existingUser = yield pgConnect_1.default.query('SELECT * FROM members WHERE name = $1 AND room_id = $2', [name, roomId]);
                newUser = existingUser.rows[0];
                colorId = newUser.color_id;
                const gmExists = yield pgConnect_1.default.query('SELECT id FROM members WHERE room_id = $1 AND role = $2 ', [roomId, adminId]);
                if (gmExists.rows.length === 0) {
                    yield pgConnect_1.default.query('UPDATE members SET role = $1 WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM members WHERE room_id = $3 and role = $1 )', [adminId, newUser.id, roomId]);
                }
            }
            const colorHexTable = yield pgConnect_1.default.query('SELECT * FROM colors WHERE id=$1', [colorId]);
            const colorHex = colorHexTable.rows[0];
            console.log(`user ${name} has been added into clique ${roomName}`);
            socket.join(roomId);
            socket.emit("JoinedClique", {
                message: `Successfully joined ${roomName} `, room: roomExists.rows[0], user: newUser, colorHex
            });
            socketUserMap.set(socket.id, { userId: newUser.id, roomId, isAdmin: newUser.role === 2 });
            return socket.to(roomId).emit("userJoined", { message: `${username} has joined the room`, newUser, colorHex });
        }
        catch (error) {
            console.error("Failed to join clique", error);
            return socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
        }
    });
}

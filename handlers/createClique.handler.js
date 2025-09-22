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
exports.handleCreateClique = handleCreateClique;
const pgConnect_1 = __importDefault(require("../config/pgConnect"));
const createRoom_validation_1 = __importDefault(require("../validation/createRoom.validation"));
const redisConfig_1 = __importDefault(require("../config/redisConfig"));
function handleCreateClique(socket_1, _a, socketUserMap_1) {
    return __awaiter(this, arguments, void 0, function* (socket, { cliqueKey, cliqueName, username }, socketUserMap) {
        const { error } = createRoom_validation_1.default.validate({ cliqueKey, cliqueName, username });
        if (error) {
            console.error("validation failed", error.details);
            return socket.emit("Error", { message: 'Invalid input' });
        }
        try {
            let adminRoleId = yield redisConfig_1.default.get("adminId");
            if (!adminRoleId) {
                const adminRoleResult = yield pgConnect_1.default.query(`SELECT id FROM roles WHERE name=$1`, ['admin']);
                if (adminRoleResult.rows.length > 0) {
                    yield redisConfig_1.default.set("adminId", adminRoleResult.rows[0].id);
                    console.log('Cached adminId in Redis');
                }
                else {
                    socket.emit("Error", { message: 'Internal server error' });
                    throw new Error("Admin role not found in roles table");
                }
                adminRoleId = adminRoleResult.rows[0].id;
            }
            const createdRoom = yield pgConnect_1.default.query('INSERT INTO rooms (id,clique_key,name) VALUES (gen_random_uuid(),$1,$2) RETURNING * ', [cliqueKey, cliqueName]);
            const roomId = createdRoom.rows[0].id;
            const roomName = createdRoom.rows[0].name;
            const savedName = username.trim().toLowerCase();
            const colorResult = yield pgConnect_1.default.query(`SELECT id FROM colors ORDER BY random() LIMIT 1`);
            const colorId = colorResult.rows[0].id;
            const newUserResult = yield pgConnect_1.default.query('INSERT INTO members (name, room_id, role,color_id) VALUES ($1,$2,$3,$4) RETURNING *', [savedName, roomId, adminRoleId, colorId]);
            const newUser = newUserResult.rows[0];
            const colorHexTable = yield pgConnect_1.default.query('SELECT * FROM colors WHERE id=$1', [colorId]);
            const colorHex = colorHexTable.rows[0];
            socket.join(roomId);
            socketUserMap.set(socket.id, { userId: newUser.id, roomId, isAdmin: newUser.role === 2 });
            socket.to(roomId).emit("userJoined", { message: `${savedName} has joined the room`, savedName });
            console.log(`clique ${roomName} created by ${savedName}`);
            return socket.emit("CliqueCreated", { message: 'Clique created', room: createdRoom.rows[0], user: newUser, colorHex });
        }
        catch (error) {
            if (error.code === "23505") {
                return socket.emit("Error", { message: "This key has already been taken" });
            }
            console.error("Failed to create clique", error);
            return socket.emit("Error", { message: "Failed to create room due to an error, please try again" });
        }
    });
}

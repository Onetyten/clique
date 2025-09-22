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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const createClique_handler_1 = require("./handlers/createClique.handler");
const joinClique_handler_1 = require("./handlers/joinClique.handler");
const fetchGuests_route_1 = __importDefault(require("./routes/guest/fetchGuests.route"));
const chatMessage_handler_1 = require("./handlers/chatMessage.handler");
const AskQuestion_handler_1 = require("./handlers/AskQuestion.handler");
const incorrectAnswer_handler_1 = require("./handlers/incorrectAnswer.handler");
const cacheRoleID_1 = require("./cache/cacheRoleID");
const handleSessionOver_1 = require("./handlers/handleSessionOver");
const endClique_handler_1 = require("./handlers/endClique.handler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
(0, cacheRoleID_1.CacheRoleIDs)();
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/room", (req, res) => {
    const roomIndex = req.query.index;
    if (!roomIndex) {
        return res.status(400).send("Room index is missing.");
    }
    res.render("room", { roomIndex: roomIndex });
});
app.use('/room', fetchGuests_route_1.default);
const port = process.env.PORT;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    },
});
const socketUserMap = new Map();
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.on("CreateClique", (data) => (0, createClique_handler_1.handleCreateClique)(socket, data, socketUserMap));
    socket.on("joinClique", (data) => (0, joinClique_handler_1.handleJoinClique)(socket, data, socketUserMap));
    socket.on("ChatMessage", (data) => (0, chatMessage_handler_1.handleChatMessage)(socket, data));
    socket.on("answeredIncorrectly", (data) => (0, incorrectAnswer_handler_1.WrongAnswerMessage)(socket, data));
    socket.on("askQuestion", (data) => (0, AskQuestion_handler_1.handleAskQuestion)(socket, data));
    socket.on("sessionOver", (data) => (0, handleSessionOver_1.handleSessionOver)(io, socket, data));
    socket.on("disconnect", (reason) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`User disconnected:, ${socket.id} due to ${reason}`);
        const userData = socketUserMap.get(socket.id);
        socketUserMap.delete(socket.id);
        if (!userData)
            return;
        const { roomId } = userData;
        const availableMembers = [...socketUserMap.values()].filter(member => member.roomId === roomId);
        if (availableMembers.length === 0) {
            console.log(`Room ${roomId} is empty waiting 120 seconds before cleanup...`);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                const finalMemberCheck = [...socketUserMap.values()].filter(member => member.roomId === roomId);
                if (finalMemberCheck.length === 0) {
                    console.log(`Scorched Earth! Cleaning up room ${roomId}`);
                    yield (0, endClique_handler_1.scorchedEarth)(roomId);
                }
                else {
                    console.log(`Room ${roomId} was repopulated. Skipping cleanup.`);
                }
            }), 120000);
        }
    }));
});
server.listen(port, () => {
    console.log("clique is up and running");
});

import dotenv from 'dotenv'
dotenv.config()
import express, { Request, Response } from "express";
import cors from 'cors'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io';
import { handleCreateClique } from './handlers/createClique.handler';
import { handleJoinClique } from './handlers/joinClique.handler';
import fetchGuestRoute from './routes/guest/fetchGuests.route'
import { handleChatMessage } from './handlers/chatMessage.handler';
import { handleAskQuestion } from './handlers/AskQuestion.handler';
import { WrongAnswerMessage } from './handlers/incorrectAnswer.handler';
import { CacheRoleIDs } from './cache/cacheRoleID';
import { handleSessionOver } from './handlers/handleSessionOver';
import pool from './config/pgConnect';



const app = express()
app.use(cors({origin:"*"}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

CacheRoleIDs()

app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/room",(req:Request,res:Response)=>{
    const roomIndex = req.query.index
    if (!roomIndex){
        return res.status(400).send("Room index is missing.")
    }
    res.render("room",{roomIndex:roomIndex})
})

app.use('/room',fetchGuestRoute)

const port = process.env.PORT 

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:"*"
    },
})

const socketUserMap = new Map<string,{userId:string,roomId:string,isAdmin:boolean}>()

io.on("connection",(socket:Socket)=>{
    console.log("A user connected",socket.id)
    socket.on("CreateClique",(data)=>handleCreateClique(socket,data))
    socket.on("joinClique",(data)=>handleJoinClique(socket,data,socketUserMap))
    socket.on("ChatMessage",(data)=>handleChatMessage(socket,data))
    socket.on("answeredIncorrectly",(data)=>WrongAnswerMessage(socket,data))
    socket.on("askQuestion",(data)=>handleAskQuestion(socket,data))
    socket.on("sessionOver",(data)=>handleSessionOver(io,socket,data))

    socket.on("disconnect",async (reason)=>{
        console.log(`User disconnected:, ${socket.id} due to ${reason}`)
        const userData  = socketUserMap.get(socket.id)
        if (!userData) return
        if (userData.isAdmin){
            console.log("Admin disconnected, ending ongoing session");
            const res = await pool.query("UPDATE sessions SET is_active = false WHERE room_id = $1 AND is_active = true RETURNING *",[userData.roomId])
            if (res.rows.length>0){
                io.to(userData.roomId).emit("AdminDisconnect", {
                    adminMessage: "Session ended because the game master disconnected",
                    session: res.rows[0]
                });
            }
        }
        socketUserMap.delete(socket.id)
    })
})

server.listen(port,()=>{
    console.log("clique is up and running")
})

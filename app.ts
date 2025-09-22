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
import { scorchedEarth } from './handlers/endClique.handler';



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
    socket.on("CreateClique",(data)=>handleCreateClique(socket,data,socketUserMap))
    socket.on("joinClique",(data)=>handleJoinClique(socket,data,socketUserMap))
    socket.on("ChatMessage",(data)=>handleChatMessage(socket,data))
    socket.on("answeredIncorrectly",(data)=>WrongAnswerMessage(socket,data))
    socket.on("askQuestion",(data)=>handleAskQuestion(socket,data))
    socket.on("sessionOver",(data)=>handleSessionOver(io,socket,data))

    socket.on("disconnect",async (reason)=>{
        console.log(`User disconnected:, ${socket.id} due to ${reason}`)
        const userData = socketUserMap.get(socket.id)
        socketUserMap.delete(socket.id)
        if (!userData) return
        const { roomId } = userData
        const availableMembers = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
        if (availableMembers.length === 0){
            console.log(`Room ${roomId} is empty waiting 120 seconds before cleanup...`)
            setTimeout(async()=>{
                const finalMemberCheck = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
                if (finalMemberCheck.length === 0){
                    console.log(`Scorched Earth! Cleaning up room ${roomId}`)
                    await scorchedEarth(roomId)
                }
                else{
                    console.log(`Room ${roomId} was repopulated. Skipping cleanup.`)
                }
            },120000)
        }

    })
})

server.listen(port,()=>{
    console.log("clique is up and running")
})

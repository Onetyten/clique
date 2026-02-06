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
import { handleSessionOver } from './handlers/handleSessionOver';
import { handleDisconnect } from './handlers/disconnectHandler';
import { handleRejoinClique } from './handlers/rejoinClique.handler';
import { handleValidateToken } from './handlers/handleValidateToken.handler';


const rootDir = path.basename(__dirname) === "dist"?path.join(__dirname,".."):__dirname
const app = express()
app.use(cors({origin:"*"}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(rootDir,"public")))
app.use(express.static(path.join(rootDir,"client","dist")))
app.set("view engine","ejs")
app.set("views",path.join(rootDir,"views"))

app.get("/v1",(req,res)=>{
    res.render("index")
})

app.get("/v1/room",(req:Request,res:Response)=>{
    const roomIndex = req.query.index
    if (!roomIndex){
        return res.status(400).send("Room index is missing.")
    }
    res.render("room",{roomIndex:roomIndex})
})

app.use('/room',fetchGuestRoute)


app.get(/.*/,(req:Request,res:Response)=>{
    res.sendFile(path.join(rootDir,"client","dist","index.html"))
})



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
    socket.on("rejoinClique",(data)=>handleRejoinClique(socket,data,socketUserMap))
    socket.on("validateToken",(data)=>handleValidateToken(socket,data,socketUserMap))
    socket.on("ChatMessage",(data)=>handleChatMessage(socket,data))
    socket.on("answeredIncorrectly",(data)=>WrongAnswerMessage(socket,data))
    socket.on("askQuestion",(data)=>handleAskQuestion(socket,data))
    socket.on("sessionOver",(data)=>handleSessionOver(io,socket,data))
    socket.on("disconnect",async (reason)=>handleDisconnect(socket,reason,socketUserMap,))
})

server.listen(port,()=>{
    console.log("clique is up and running")
})

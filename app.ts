import dotenv from 'dotenv'
dotenv.config()
import express, { Request, Response, urlencoded } from "express";
import cors from 'cors'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io';
import { handleCreateClique } from './handlers/createClique.handler';
import { handleJoinClique } from './handlers/joinClique.handler';
import fetchGuestRoute from './routes/guest/fetchGuests.route'
import { handleChatMessage } from './handlers/chatMessage.handler';
import { handleAskQuestion } from './handlers/AskQuestion.handler';
import { CorrectAnswerMessage } from './handlers/correctAnswer.handler';
import { WrongAnswerMessage } from './handlers/incorrectAnswer.handler';



const app = express()
app.use(cors({origin:"*"}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

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

io.on("connection",(socket:Socket)=>{
    console.log("A user connected",socket.id)
    socket.on("CreateClique",(data)=>handleCreateClique(socket,data))
    socket.on("joinClique",(data)=>handleJoinClique(socket,data))
    socket.on("ChatMessage",(data)=>handleChatMessage(socket,data))
    socket.on("answeredCorrectly",(data)=>CorrectAnswerMessage(socket,data))
    socket.on("answeredIncorrectly",(data)=>WrongAnswerMessage(socket,data))
    socket.on("askQuestion",(data)=>handleAskQuestion(socket,data))
    
    socket.on("disconnect",()=>{
        console.log("User disconnected:", socket.id)
    })
})

server.listen(port,()=>{
    console.log("clique is up and running")
})

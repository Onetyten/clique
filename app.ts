import dotenv from 'dotenv'
dotenv.config()
import express, { urlencoded } from "express";
import cors from 'cors'
import path from 'path'
import createRoomRoute from './routes/createRoom.route'

const app = express()
app.use(cors({origin:"*"}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

app.get("/",(req,res)=>{
    res.render("index",{ username:"Adetayo" })
})

app.get("/room",(req,res)=>{
    res.render("room",{ username:"Adetayo" })
})

app.use('/room',createRoomRoute)


const port = process.env.PORT 

app.listen(port,()=>{
    console.log("clique is up and running")
})



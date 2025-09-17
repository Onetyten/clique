import { Socket } from "socket.io";
import { UserType } from "../types/type";
import pool from "../config/pgConnect";

interface QuestionType{
  question:string;
  answer:string
  user:UserType,
  endTime: number
} 

export async function handleAskQuestion(socket: Socket, { user,question,answer, endTime }: QuestionType) {
  const gameRoom = await pool.query(`SELECT * FROM members WHERE room_id=$1`,[user.room_id])

  if (gameRoom.rows.length <= 2) return socket.emit("questionError", { message: "There must be more that two players to start a game session" });
  
  socket.to(user.room_id).emit("questionAsked", { user, question, endTime, answer });
  socket.emit("questionSuccess", { message: "Your question has been asked successfully!", question, endTime, answer })

  setTimeout(()=>{
     socket.to(user.room_id).emit("questionTimeout", { user, question, endTime,answer });
  },
  60000)
}
import { Socket } from "socket.io";
import { UserType } from "../types/type";

interface QuestionType{
  question:string;
  answer:string
  user:UserType,
  endTime: number
} 

export async function handleAskQuestion(socket: Socket, { user,question,answer, endTime }: QuestionType) {
  socket.to(user.room_id).emit("questionAsked", { user, question, endTime, answer });
  setTimeout(()=>{
     socket.to(user.room_id).emit("questionTimeout", { user, question, endTime,answer });
  },
  60000)
}
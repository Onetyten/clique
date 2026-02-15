import { Socket } from "socket.io";
import { ChatType, ChatUserType } from "../types/type";



export async function SendMessage(socket:Socket,user:ChatUserType,message:string,timeStamp:number, type:"chat" | "question" | "correct" | "wrong" | "answer" ){
    socket.to(user.room_id).emit("messageSent", { user, type, message, timeStamp });
    socket.emit("messageDelivered",{ user, message, timeStamp });
}
import { Socket } from "socket.io";
import { ChatType } from "../types/type";

export async function handleChatMessage(socket: Socket, { user,color,message, timeStamp }: ChatType) {
  socket.to(user.room_id).emit("messageSent", { user, message, timeStamp,color });
}
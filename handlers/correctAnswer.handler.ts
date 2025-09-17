import { Socket } from "socket.io";
import { ChatType } from "../types/type";

export async function CorrectAnswerMessage(socket: Socket, { user,color,message, timeStamp }: ChatType) {
  socket.to(user.room_id).emit("questionAnsweredCorrectly", { user, message, timeStamp,color });
}
import { Socket } from "socket.io";
import { ChatType } from "../types/type";

export async function WrongAnswerMessage(socket: Socket, { user,color,message, timeStamp }: ChatType) {
  socket.to(user.room_id).emit("questionAnsweredWrong", { user, message, timeStamp,color });
}
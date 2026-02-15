import { Socket } from "socket.io";
import { ChatType } from "../types/type";
import { SendMessage } from "../services/chat.service";

export async function handleChatMessage(socket: Socket, { user,message,timeStamp }: ChatType) {
  SendMessage(socket,user,message,timeStamp,"chat")
}

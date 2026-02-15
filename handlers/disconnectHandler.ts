import { DisconnectReason, Socket } from "socket.io"
import { scorchedEarth } from "./endClique.handler";
import { logger } from "../app";




export async function handleDisconnect(socket:Socket,reason: DisconnectReason,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>) {
    logger.info(`User disconnected:, ${socket.id} due to ${reason}`)
    const userData = socketUserMap.get(socket.id)
    socketUserMap.delete(socket.id)
    if (!userData) return
    const { roomId } = userData
    const availableMembers = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
    if (availableMembers.length === 0){
        logger.warn(`Room ${roomId} is empty waiting 120 seconds before cleanup...`)
        setTimeout(async()=>{
            const finalMemberCheck = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
            if (finalMemberCheck.length === 0){
                logger.info(`Scorched Earth! Cleaning up room ${roomId}`)
                await scorchedEarth(roomId)
            }
            else{
                logger.info(`Room ${roomId} was repopulated. Skipping cleanup.`)
            }
        },120000)
    }    
}
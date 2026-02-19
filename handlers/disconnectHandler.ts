import { DisconnectReason, Server, Socket } from "socket.io"
import { scorchedEarth } from "./endClique.handler";
import { logger } from "../app";
import pool from "../config/pgConnect";
import { assignNextAdmin } from "../services/admin.service";
import { startGraceTimer } from "../services/session.service";




export async function handleDisconnect(io:Server, socket:Socket,reason: DisconnectReason,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>,graceTimeoutMap: Map<string, NodeJS.Timeout>) {

    logger.info(`User disconnected:, ${socket.id} due to ${reason}`)
    const userData = socketUserMap.get(socket.id)
    socketUserMap.delete(socket.id)
    if (!userData) return
    const { roomId,userId,isAdmin } = userData
    const availableMembers = [...socketUserMap.values()].filter(member=>member.roomId === roomId)

    logger.info(`${userId} disconnected from room ${roomId}, starting 30s reassignment timer`)

    startGraceTimer(io, userId, roomId, isAdmin, userId, socketUserMap, graceTimeoutMap);


    if (availableMembers.length === 0){
        logger.warn(`Room ${roomId} is empty waiting 120 seconds before cleanup...`)
        setTimeout(async()=>{
            const finalMemberCheck = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
            if (finalMemberCheck.length === 0){
                logger.info(`Scorched Earth! Cleaning up room ${roomId}`)
                const graceKey = `${userId}:${roomId}`;
                clearTimeout(graceTimeoutMap.get(graceKey));
                graceTimeoutMap.delete(graceKey);
                await scorchedEarth(roomId)
            }
            else{
                logger.info(`Room ${roomId} was repopulated. Skipping cleanup.`)
            }
        },120000)
    }    
}
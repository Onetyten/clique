import { DisconnectReason, Socket } from "socket.io"
import { scorchedEarth } from "./endClique.handler";




export async function handleDisconnect(socket:Socket,reason: DisconnectReason,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>) {
    console.log(`User disconnected:, ${socket.id} due to ${reason}`)
    const userData = socketUserMap.get(socket.id)
    socketUserMap.delete(socket.id)
    if (!userData) return
    const { roomId } = userData
    const availableMembers = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
    if (availableMembers.length === 0){
        console.log(`Room ${roomId} is empty waiting 120 seconds before cleanup...`)
        setTimeout(async()=>{
            const finalMemberCheck = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
            if (finalMemberCheck.length === 0){
                console.log(`Scorched Earth! Cleaning up room ${roomId}`)
                await scorchedEarth(roomId)
            }
            else{
                console.log(`Room ${roomId} was repopulated. Skipping cleanup.`)
            }
        },120000)
    }    
}
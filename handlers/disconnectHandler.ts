import { DisconnectReason, Server, Socket } from "socket.io"
import { scorchedEarth } from "./endClique.handler";
import { logger } from "../app";
import pool from "../config/pgConnect";
import { assignNextAdmin } from "../services/admin.service";




export async function handleDisconnect(io:Server, socket:Socket,reason: DisconnectReason,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>) {
    logger.info(`User disconnected:, ${socket.id} due to ${reason}`)
    const userData = socketUserMap.get(socket.id)
    socketUserMap.delete(socket.id)
    if (!userData) return
    const { roomId,userId,isAdmin } = userData
    const availableMembers = [...socketUserMap.values()].filter(member=>member.roomId === roomId)

    logger.info(`${userId} disconnected from room ${roomId}, starting 30s reassignment timer`)

    const graceTimeout = setTimeout(async ()=>{
            const userReconnected = [...socketUserMap.values()].find( member => member.userId === userId && member.roomId === roomId )
            if (userReconnected) {
                logger.info(`User ${userId} reconnected, skipping reassignment`)
                return
            }
            const client = await pool.connect()
            try{

                const deleted = await client.query( `DELETE FROM members WHERE id = $1 AND room_id = $2 RETURNING name`, [userId, roomId])
                if (deleted.rows.length>0){
                    io.to(roomId).emit("userLeft", {message: `${deleted.rows[0].name} left`}) 
                }

                if (!isAdmin) return
                logger.info(`Admin ${userId} disconnected from room ${roomId}, assigning new admin`)
            
                await client.query("BEGIN")
                const newAdmin = await assignNextAdmin(client, roomId, userId)

                if (!newAdmin) {
                    logger.warn(`No eligible next admin found in room ${roomId}`)
                    await client.query("ROLLBACK")
                    return
                }

                await client.query("COMMIT")
                logger.info(`Reassigned admin in room ${roomId} to ${newAdmin.name}`)
                io.to(roomId).emit("adminAssignment", { message: `The new Game Master is ${newAdmin.name}`}) 
            }
            catch (err) {
                await client.query("ROLLBACK")
                logger.error(`Failed to reassign admin in room ${roomId}: ${err}`)
            }

            finally {
                client.release()
                clearTimeout(graceTimeout)
            }
    },30000)



    if (availableMembers.length === 0){
        logger.warn(`Room ${roomId} is empty waiting 120 seconds before cleanup...`)
        setTimeout(async()=>{
            const finalMemberCheck = [...socketUserMap.values()].filter(member=>member.roomId === roomId)
            if (finalMemberCheck.length === 0){
                logger.info(`Scorched Earth! Cleaning up room ${roomId}`)
                clearTimeout(graceTimeout)
                await scorchedEarth(roomId)
            }
            else{
                logger.info(`Room ${roomId} was repopulated. Skipping cleanup.`)
            }
        },120000)
    }    
}
import { PoolClient } from "pg"
import { sessionType } from "../types/type"
import { roleID } from "../config/role"
import { assignNextAdmin } from "./admin.service"
import { Socket } from "socket.io"
import pool from "../config/pgConnect"

export async function endCurrentSession(socket:Socket,client:PoolClient,currentSession:sessionType) {
    const ongoingSessions = await client.query('SELECT id FROM sessions WHERE room_id = $1 and is_active = true',[currentSession.room_id])
    if (ongoingSessions.rows.length == 0 ){
        await client.query("ROLLBACK")
        return
    }
    await client.query(`UPDATE sessions SET is_active=false WHERE id = $1`,[currentSession.id])
    const guestID = roleID.guest

    await client.query(`UPDATE members SET role = $1 WHERE id = $2`,[guestID,currentSession.gm_id])
    console.log("oldGm id",currentSession.gm_id)
    
    const newGM = await assignNextAdmin(client,currentSession.room_id,currentSession.gm_id)
    console.log("exit")

    if (!newGM) {
        await client.query("COMMIT")
        socket.emit("Error", { message: "No members found in room" })
        return
    }

    const numberOfSession = await client.query('SELECT COUNT (*) FROM sessions WHERE room_id = $1',[currentSession.room_id])
    const totalSessions = parseInt(numberOfSession.rows[0].count, 10)
    const roundNum = totalSessions +1

    return {roundNum,newGM}
}


export async function endExpiredSessionOnStart(socket:Socket){
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const expiredSessions = await pool.query(
            `SELECT id,room_id from sessions
            WHERE end_time <= NOW()
            AND is_active = true
            `
        )
        for (const row of expiredSessions.rows) {
            await endCurrentSession(socket,client,row)
        } 
        await client.query("COMMIT")
    }
    catch (error) {
        console.error(error)
    }
    finally{
        client.release()
    }
}
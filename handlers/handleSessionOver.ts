import { Server, Socket } from "socket.io";
import { sessionType, UserType } from "../types/type";
import sessionSchema from "../validation/endSessionSchema";
import pool from "../config/pgConnect";
import redis from "../config/redisConfig";


interface propTypes{
    currentSession:sessionType,
    isAnswer:boolean,
    user:UserType
}



export async function handleSessionOver(io:Server,socket:Socket,{currentSession,user,isAnswer}:propTypes) {
        const { error} = sessionSchema.validate({currentSession,user,isAnswer});
        if (error){
            console.error("validation failed",error.details);
            return socket.emit("Error",{message:'Invalid input'})
        }
        try {
            const ongoingSessions = await pool.query('SELECT id FROM sessions WHERE room_id = $1 and is_active = true',[currentSession.room_id])
            if (ongoingSessions.rows.length == 0 ){
                return
            }
            await pool.query(`UPDATE sessions SET is_active=false WHERE id = $1`,[currentSession.id])
            const addedScore = 10
            const guestID = parseInt(await redis.get('guestId') || "1", 10)
            const adminId = parseInt(await redis.get('adminId') || "2", 10)
            console.log("adminId", adminId, typeof adminId);
            console.log("guestID", guestID, typeof guestID);
            await pool.query(`UPDATE members SET role = $1 WHERE id = $2`,[guestID,currentSession.gm_id])
            console.log("oldGm id",currentSession.gm_id)
            let newGMTable = await pool.query('SELECT * FROM members WHERE room_id = $1 AND was_gm IS false ORDER  BY RANDOM () LIMIT 1',[currentSession.room_id])
            
            if (newGMTable.rows.length==0){
                await pool.query('UPDATE members SET was_gm = false WHERE room_id = $1',[currentSession.room_id])
                newGMTable = await pool.query('SELECT * FROM members WHERE room_id = $1 AND was_gm IS false ORDER  BY RANDOM () LIMIT 1',[currentSession.room_id])
                if (newGMTable.rows.length == 0){
                     return socket.emit("Error", { message: "No members found in the room." });
                }
              
            }
            const numberOfSession = await pool.query('SELECT COUNT (*) FROM sessions WHERE room_id = $1',[currentSession.room_id])
            const totalSessions = parseInt(numberOfSession.rows[0].count, 10)
            const roundNum = totalSessions +1
            const newGM = newGMTable.rows[0]
            console.log("newGM",newGM)
            await pool.query(
            `UPDATE members 
            SET role = CASE WHEN id = $1 THEN $2::smallint ELSE $3::smallint END,
                was_gm = CASE WHEN id = $1 THEN true ELSE was_gm END
            WHERE room_id = $4`,
            [newGM.id, adminId, guestID, currentSession.room_id]
            )

            if (isAnswer==true){
                console.log("answer correct session over")
                await pool.query('UPDATE members SET score = score + $1 WHERE id=$2',[addedScore,user.id])
                return  io.to(currentSession.room_id).emit("answerCorrect", {message:`Correct, ${addedScore} points to ${user.name}`,adminMessage:`The new Game Master is ${newGM.name}`,correctUser:user, session:currentSession,roundNum})
            }
            console.log("timed out session over")
            return io.to(currentSession.room_id).emit("timeoutHandled", {adminMessage:`The new Game Master is ${newGM.name}`,session:currentSession,roundNum})
        } 
        catch (error) {
            console.log(error)
            return  socket.emit("Error", { message: "Internal server error" });
        }

}
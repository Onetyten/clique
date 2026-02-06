import { Server, Socket } from "socket.io";
import { sessionType, UserType } from "../types/type";
import sessionSchema from "../validation/endSessionSchema";
import pool from "../config/pgConnect";
import redis from "../config/redisConfig";
import { roleID } from "../config/role";
import { assignNextAdmin } from "../services/admin.service";


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
        const client = await pool.connect()
        try {
            await client.query("BEGIN")

            const ongoingSessions = await client.query('SELECT id FROM sessions WHERE room_id = $1 and is_active = true',[currentSession.room_id])
            if (ongoingSessions.rows.length == 0 ){
                await client.query("ROLLBACK")
                return
            }
            await client.query(`UPDATE sessions SET is_active=false WHERE id = $1`,[currentSession.id])
            const addedScore = 10
            const guestID = roleID.guest
            
            await client.query(`UPDATE members SET role = $1 WHERE id = $2`,[guestID,currentSession.gm_id])
            console.log("oldGm id",currentSession.gm_id)
            
            const newGM = await assignNextAdmin(client,currentSession.room_id,currentSession.gm_id)

            if (!newGM) {
                await client.query("COMMIT")
                return socket.emit("Error", { message: "No members found in room" })
            }

            const numberOfSession = await client.query('SELECT COUNT (*) FROM sessions WHERE room_id = $1',[currentSession.room_id])
            const totalSessions = parseInt(numberOfSession.rows[0].count, 10)
            const roundNum = totalSessions +1

            if (isAnswer==true){
                console.log("answer correct session over")
                await client.query('UPDATE members SET score = score + $1 WHERE id=$2',[addedScore,user.id])

                await client.query("COMMIT")

                return io.to(currentSession.room_id).emit("answerCorrect", {message:`Correct, ${addedScore} points to ${user.name}`,adminMessage:`The new Game Master is ${newGM.name}`,correctUser:user, session:currentSession,roundNum})
            }

            console.log("timed out session over")
            io.to(currentSession.room_id).emit("timeoutHandled", {adminMessage:`The new Game Master is ${newGM.name}`,session:currentSession,roundNum})
            await client.query("COMMIT")

            
        } 
        catch (error) {
            await client.query("ROLLBACK")
            console.log(error)
            return  socket.emit("Error", { message: "Internal server error" });
        }
        finally {
            client.release()
        }

}
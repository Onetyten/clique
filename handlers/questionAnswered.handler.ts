import { Server, Socket } from "socket.io";
import { sessionType, UserType } from "../types/type";
import sessionSchema from "../validation/endSessionSchema";
import pool from "../config/pgConnect";
import redis from "../config/redisConfig";
import { roleID } from "../config/role";
import { assignNextAdmin } from "../services/admin.service";
import { endCurrentSession } from "../services/session.service";
import { SendMessage } from "../services/chat.service";
import { logger } from "../app";


interface propTypes{
    currentSession:sessionType,
    answer:string,
    user:UserType,
    timestamp:number
}

export async function handleQuestionAnswered(io:Server,socket:Socket,{currentSession,user,answer,timestamp}:propTypes,sessionTimeoutMap: Map<string, { timeout: NodeJS.Timeout; interval: ReturnType<typeof setInterval>;}>) {
        const { error} = sessionSchema.validate({currentSession,user});
        if (error){
            logger.error({error: error.details},"request validation failed");
            return socket.emit("Error",{message:'Invalid input'})
        }


        const client = await pool.connect()
        try {
            await client.query("BEGIN")
            
            const sessionResult = await client.query(
                `SELECT * from sessions
                where id= $1
                `,[currentSession.id]
            )

            if (sessionResult.rows.length === 0 ){
                await client.query("ROLLBACK")
                logger.info(`user ${user.name} answered a question without a session ongoing`)
                socket.emit("Error", { message: `There is no ongoing game session` }) 
            }

            const session:sessionType  = sessionResult.rows[0]

            if (session.is_active === false){
                logger.info(`user ${user.name} answered the question after the game session was been concluded`)
                socket.emit("Info", { message: `Oops, this game session has been concluded` })
                return
            }
            const answerCorrect = session.answer.toLowerCase().trim() === answer.toLowerCase().trim()

            if (!answerCorrect){
                logger.info(`user ${user.name} answered the question incorrectly`)
                socket.emit("Incorrect Answer", { message: `Incorrect Answer` })
                SendMessage(socket,user,answer,timestamp,"wrong")
                return
            }
            if (timestamp>session.end_time){
                logger.info(`user ${user.name} answered the question after game timed out`)
                socket.emit("Error", { message: `Game timed out` }) 
                endCurrentSession(socket,client,currentSession)
                return
            }

            SendMessage(socket,user,answer,timestamp,"correct")
            let addedScore = 10
            const result = await endCurrentSession(socket,client,currentSession)

            const timers = sessionTimeoutMap.get(currentSession.id);
            if (timers) {
                clearTimeout(timers.timeout);
                clearInterval(timers.interval);
                sessionTimeoutMap.delete(currentSession.id);
                logger.info(`Cleared timeout and interval for session ${currentSession.id}`)
            }

            if (!result) return
            const {roundNum, newGM} = result
            logger.info(`user ${user.name} answered the question correctly`)
            
            await client.query('UPDATE members SET score = score + $1 WHERE id=$2',[addedScore,user.id])
            await client.query("COMMIT")

            const newName = user.name.charAt(0).toUpperCase() + user.name.slice(1);
            return io.to(currentSession.room_id).emit("answerCorrect", {message:`${newName} takes it, +${addedScore} points to ${newName}`,adminMessage:`The new Game Master is ${newGM.name}`,correctUser:user, session:currentSession,roundNum})

        } 
        catch (error) {
            await client.query("ROLLBACK")
            logger.info(error)
            return  socket.emit("Error", { message: "Internal server error" });
        }
        finally {
            client.release()
        }

}
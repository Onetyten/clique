import { Server, Socket } from "socket.io";
import { sessionType, UserType } from "../types/type";
import sessionSchema from "../validation/endSessionSchema";
import pool from "../config/pgConnect";
import redis from "../config/redisConfig";
import { roleID } from "../config/role";
import { assignNextAdmin } from "../services/admin.service";
import { endCurrentSession } from "../services/session.service";
import { SendMessage } from "../services/chat.service";


interface propTypes{
    currentSession:sessionType,
    answer:string,
    user:UserType,
    timestamp:number
}

export async function handleQuestionAnswered(io:Server,socket:Socket,{currentSession,user,answer,timestamp}:propTypes,sessionTimeoutMap: Map<string, NodeJS.Timeout>) {
        const { error} = sessionSchema.validate({currentSession,user});
        if (error){
            console.error("validation failed",error.details);
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
                socket.emit("Error", { message: `There is no ongoing game session` }) 
            }

            const session:sessionType  = sessionResult.rows[0]

            if (session.is_active === false){
                socket.emit("Info", { message: `Oops, this game session has been concluded` })
                return
            }
            const answerCorrect = session.answer.toLowerCase().trim() === answer.toLowerCase().trim()

            if (!answerCorrect){
                socket.emit("Incorrect Answer", { message: `Incorrect Answer` })
                SendMessage(socket,user,answer,timestamp,"wrong")
                return
            }
            if (timestamp>session.end_time){
                 socket.emit("Error", { message: `Game timed out` }) 
                 endCurrentSession(socket,client,currentSession)
                 return
            }

            SendMessage(socket,user,answer,timestamp,"correct")
            let addedScore = 10
            const result = await endCurrentSession(socket,client,currentSession)

            const timeout = sessionTimeoutMap.get(currentSession.id);
                if (timeout) {
                    clearTimeout(timeout);
                    sessionTimeoutMap.delete(currentSession.id);
            }
            
            if (!result) return
            const {roundNum, newGM} = result
            console.log("answer correct session over")
            await client.query('UPDATE members SET score = score + $1 WHERE id=$2',[addedScore,user.id])
            await client.query("COMMIT")

            return io.to(currentSession.room_id).emit("answerCorrect", {message:`Correct, ${addedScore} points to ${user.name}`,adminMessage:`The new Game Master is ${newGM.name}`,correctUser:user, session:currentSession,roundNum})
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
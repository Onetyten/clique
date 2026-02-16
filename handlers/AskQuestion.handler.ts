import { Server, Socket } from "socket.io";
import { UserType } from "../types/type";
import pool from "../config/pgConnect";
import { roleID } from "../config/role";
import { endCurrentSession } from "../services/session.service";
import { logger } from "../app";
import { SendMessage } from "../services/chat.service";

interface QuestionType{
  question:string;
  answer:string
  user:UserType,
  endTime: number
} 

export async function handleAskQuestion(io:Server,socket: Socket, { user,question,answer, endTime }: QuestionType,sessionTimeoutMap: Map<string, { timeout: NodeJS.Timeout; interval: ReturnType<typeof setInterval>;}>) {

  const client = await pool.connect()
  try {
      const gameRoom = await client.query(`SELECT COUNT (*) FROM members WHERE room_id=$1`, [user.room_id])
      
      if (gameRoom.rows[0].count < 2 ){
        socket.emit("questionError", { message: "There must be at least two players to start a game session" });
      }

      let adminId: number = roleID.admin;
      if (user.role !== adminId) return socket.emit("questionError", { message: "Only Game masters can ask questions" });
      const timestamp = endTime-(60*1000)

      const questionMessage = `Question : ${question}`
      SendMessage(socket,user,questionMessage,timestamp,"question")

      const session = await client.query(`INSERT INTO sessions (is_active,room_id,gm_id,question,answer,end_time) values ($1,$2,$3,$4,$5,$6) RETURNING *`, [true,user.room_id,user.id,question,answer,endTime])

      const numberOfSession = await client.query(`
        SELECT COUNT (*)
        FROM sessions
        WHERE room_id = $1`,
      [user.room_id])
      
      const roundNum = parseInt(numberOfSession.rows[0].count, 10)
      io.to(user.room_id).emit("questionAsked", { session:session.rows[0],roundNum });

      logger.info(`new session created in room ${session.rows[0].room_id}`)


      const activeSessions = await client.query(
        `SELECT id FROM sessions WHERE room_id = $1 AND is_active = true AND id != $2`,
        [user.room_id,session.rows[0].id]
      );

      for (const row of activeSessions.rows) {
        const existing = sessionTimeoutMap.get(row.id);
        if (existing) {
          clearTimeout(existing.timeout);
          clearInterval(existing.interval);
          sessionTimeoutMap.delete(row.id);
          logger.info(`Cleared timeout and interval for session ${row.id}`)
        }
      }

      await client.query(
        `UPDATE sessions SET is_active = false WHERE room_id = $1 AND id != $2`,
        [user.room_id,session.rows[0].id]
      );

      logger.info(`new session created in room ${session.rows[0].room_id}`)

      await client.query("UPDATE members SET was_gm = true WHERE id =$1",[user.id])

      await client.query("COMMIT")

      const existingTimers = sessionTimeoutMap.get(session.rows[0].id);
      if (existingTimers) {
          logger.warn("session timers already exist, clearing old timers")
          clearTimeout(existingTimers.timeout);
          clearInterval(existingTimers.interval);
          sessionTimeoutMap.delete(session.rows[0].id);
      }
      const delay = Math.max(0, endTime - Date.now())

      logger.info(`${delay/1000}s Game timeout started for session ${session.rows[0].id}`)

      const UPDATE_INTERVAL = 10000;      
      const syncInterval = setInterval(() => {
        const timeRemaining = Math.max(0, endTime - Date.now());
        
        if (timeRemaining <= 5000) {
          clearInterval(syncInterval)
          return
        }
        io.to(user.room_id).emit("gameTimeSync", {
          sessionId: session.rows[0].id,
          timeRemaining: Math.floor(timeRemaining / 1000)
        });
        
        logger.info(`Time sync sent for session ${session.rows[0].id}: ${Math.floor(timeRemaining/1000)}s remaining`);
      }, UPDATE_INTERVAL);

      const sessionTimeout = setTimeout(async () => {
        const timeoutClient = await pool.connect();
        try {
            await timeoutClient.query("BEGIN")
            logger.info(`${session.rows[0].id} timed out`)
            const sessionActive = await timeoutClient.query(`
              SELECT id,room_id
              FROM sessions
              WHERE id = $1
              AND is_active = true
            `,[session.rows[0].id])

            if (sessionActive.rows.length === 0) return;

            const result = await endCurrentSession(socket, timeoutClient, session.rows[0]);
            
            if (!result) return;

            io.to(session.rows[0].room_id).emit("timeoutHandled", {
                adminMessage: `The new Game Master is ${result.newGM.name}`,
                session: session.rows[0],
                roundNum: result.roundNum
            });
            const answerMessage = `Answer : ${answer}`
            const timestamp = Date.now()
            SendMessage(socket,user,answerMessage,timestamp,"answer")
            await timeoutClient.query("COMMIT")

        } catch (err) {
            await timeoutClient.query("ROLLBACK")
            logger.error(err);
        } finally {
            timeoutClient.release();
            sessionTimeoutMap.delete(session.rows[0].id);
        }
    }, delay);  
    sessionTimeoutMap.set(session.rows[0].id,{timeout:sessionTimeout,interval:syncInterval})  


  } 

  catch (error) {
      await client.query("ROLLBACK")
      logger.error(error)
      return  socket.emit("Error", { message: "Internal server error" });
  }

  finally {
      client.release()
  }

}
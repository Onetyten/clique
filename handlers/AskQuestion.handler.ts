import { Server, Socket } from "socket.io";
import { UserType } from "../types/type";
import pool from "../config/pgConnect";
import { roleID } from "../config/role";
import { endCurrentSession } from "../services/session.service";

interface QuestionType{
  question:string;
  answer:string
  user:UserType,
  endTime: number
} 

export async function handleAskQuestion(io:Server,socket: Socket, { user,question,answer, endTime }: QuestionType,sessionTimeoutMap: Map<string, NodeJS.Timeout>) {

  const client = await pool.connect()
  try {

      const gameRoom = await client.query(`
        SELECT * FROM members
        WHERE room_id=$1`,
      [user.room_id])

      if (gameRoom.rows.length < 2 ) return socket.emit("questionError", { message: "There must be at least two players to start a game session" });

      const activeSessions = await client.query(
        `SELECT id FROM sessions WHERE room_id = $1 AND is_active = true`,
        [user.room_id]
      );

      for (const row of activeSessions.rows) {
        const existingTimeout = sessionTimeoutMap.get(row.id);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          sessionTimeoutMap.delete(row.id);
        }
      }

      await client.query(
        `UPDATE sessions SET is_active = false WHERE room_id = $1`,
        [user.room_id]
      );


      let adminId: number = roleID.admin;
        
      if (user.role !== adminId) return socket.emit("questionError", { message: "Only Game masters can ask questions" });
      const session = await client.query(`INSERT INTO sessions (is_active,room_id,gm_id,question,answer,end_time) values ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [true,user.room_id,user.id,question,answer,endTime])

      await client.query("UPDATE members SET was_gm = true WHERE id =$1",[user.id])
      const numberOfSession = await client.query(`
        SELECT COUNT (*)
        FROM sessions
        WHERE room_id = $1`,
      [user.room_id])

      const roundNum = parseInt(numberOfSession.rows[0].count, 10)
      io.to(user.room_id).emit("questionAsked", { session:session.rows[0],roundNum });

      await client.query("COMMIT")

      const existingTimeout = sessionTimeoutMap.get(session.rows[0].id);
      if (existingTimeout) {
          clearTimeout(existingTimeout);
          sessionTimeoutMap.delete(session.rows[0].id);
      }
      const delay = Math.max(0, endTime - Date.now())
      const sessionTimeout = setTimeout(async () => {
        const timeoutClient = await pool.connect();

        try {
            await timeoutClient.query("BEGIN")
            const sessionActive = await timeoutClient.query(`
              SELECT id,room_id
              FROM sessions
              WHERE id = $1
              AND is_active = true
            `,[session.rows[0].id])

            if (sessionActive.rows.length === 0) return;

            const result = await endCurrentSession(socket, timeoutClient, session.rows[0]);
            await timeoutClient.query("COMMIT")
            if (!result) return;

            io.to(session.rows[0].room_id).emit("timeoutHandled", {
                adminMessage: `The new Game Master is ${result.newGM.name}`,
                session: session.rows[0],
                roundNum: result.roundNum
            });

        } catch (err) {
            await timeoutClient.query("ROLLBACK")
            console.error(err);
        } finally {
            timeoutClient.release();
            sessionTimeoutMap.delete(session.rows[0].id);
        }
    }, delay);  
    sessionTimeoutMap.set(session.rows[0].id,sessionTimeout)  


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
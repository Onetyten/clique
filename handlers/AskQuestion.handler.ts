import { Socket } from "socket.io";
import { UserType } from "../types/type";
import pool from "../config/pgConnect";
import redis from "../config/redisConfig";

interface QuestionType{
  question:string;
  answer:string
  user:UserType,
  endTime: number
} 

export async function handleAskQuestion(socket: Socket, { user,question,answer, endTime }: QuestionType) {
  const gameRoom = await pool.query(`SELECT * FROM members WHERE room_id=$1`,[user.room_id])
  if (gameRoom.rows.length <= 2) return socket.emit("questionError", { message: "There must be more that two players to start a game session" });
  const existingSession = await pool.query('SELECT * FROM sessions WHERE room_id = $1 AND is_active IS true',[user.room_id])
  if (existingSession.rows.length>0) return socket.emit("questionError", { message: "You cannot ask questions during an existing session" });
  let adminId: string | null = await redis.get('adminId');

  if (!adminId) {
      const adminRoleResult = await pool.query('SELECT id FROM roles WHERE name=$1',['admin'])
      if (adminRoleResult.rows.length>0){
          await redis.set('adminId',adminRoleResult.rows[0].id)
          console.log('Cached adminId in Redis');
      }
      else{
        socket.emit("questionError", { message: "Server error" });
        throw new Error("Admin role not found in roles table");
      }
      adminId = adminRoleResult.rows[0].id
  }
  
  if (user.role.toString() !== adminId) return socket.emit("questionError", { message: "Only Game masters can ask questions" });
  const session = await pool.query('INSERT INTO sessions (is_active,room_id,gm_id,question,answer,end_time) values ($1,$2,$3,$4,$5,$6) RETURNING *',[true,user.room_id,user.id,question,answer,endTime])

  await pool.query("UPDATE members SET was_gm = true WHERE id =$1",[user.id])
  const numberOfSession = await pool.query('SELECT COUNT (*) FROM sessions WHERE room_id = $1',[user.room_id])
  const roundNum = parseInt(numberOfSession.rows[0].count, 10)
  socket.to(user.room_id).emit("questionAsked", { session:session.rows[0] });
  return socket.emit("questionSuccess", { message: "Your question has been asked successfully!",session:session.rows[0],roundNum})
}
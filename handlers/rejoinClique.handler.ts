import dotenv from "dotenv"
dotenv.config()
import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import jwt from "jsonwebtoken"
import userRejoinSchema from "../validation/rejoinRoom.validation";
import { roleID } from "../config/role";
import { logger } from "../app";

interface InputType{
    cliqueName:string,
    username:string,
    token:string
}

export async function handleRejoinClique(socket:Socket,{cliqueName,username,token}:InputType,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>){
        const secret = process.env.JWT_SECRET
        if (!secret){
            throw new Error(`No "JWT_SECRET" found in the .env file`)
        }
        const { error} = userRejoinSchema.validate({cliqueName,username,token});
        if (error){
            logger.error({error:error.details},"request validation failed",);
            return socket.emit("Boot Out",{message:error.message})
        }
        const decoded = jwt.verify(token,secret)

        logger.info(`request from ${username} to join clique acknowledged`)
        if (!decoded){
            logger.error("Invalid token",);
            return socket.emit("Boot Out",{message:"Please, rejoin this room"});
        }
        const name = username.toLowerCase()
        let adminId = roleID.admin


        try {
            const roomExists = await pool.query('SELECT * FROM rooms WHERE name = $1',[cliqueName]);      
            if (roomExists.rows.length === 0){
                logger.info('This room does not exist');
                return socket.emit("Error", { message: "This clique does not exist" });
            }
            
            const room = roomExists.rows[0]
            const roomName = room.name
            const roomId = room.id;
            const existingUser = await pool.query('SELECT * FROM members WHERE name = $1 AND room_id = $2', [name, roomId]);
            if (existingUser.rows.length === 0){
                return socket.emit("Error", { message: "Error reconnecting" });
            }
            const newUser = existingUser.rows[0];
            const gmExists = await pool.query('SELECT id FROM members WHERE room_id = $1 AND role = $2 ',[roomId,adminId])
            if (gmExists.rows.length === 0){
                await pool.query('UPDATE members SET role = $1 WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM members WHERE room_id = $3 and role = $1 )',[adminId,newUser.id,roomId])
            }

            logger.info(`user ${name} has been added into clique ${roomName}`);
            socket.join(roomId);
            socket.emit("JoinedClique", {
                message: `Successfully joined ${roomName} `, room:roomExists.rows[0],user: newUser
            });

            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === 2})
            return socket.to(roomId).emit("userJoined",{ message:`${username} has joined the room`,newUser})
        }
        catch (error:any) {
            logger.error("Failed to join clique",error);
            return socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
        }
    }

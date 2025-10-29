import dotenv from "dotenv"
dotenv.config()
import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import redis from "../config/redisConfig";
import jwt from "jsonwebtoken"
import userRejoinSchema from "../validation/rejoinRoom.validation";

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
            console.error("validation failed","Rejoin clique handler",error.details);
            return socket.emit("Boot Out",{message:error.message})
        }
        const decoded = jwt.verify(token,secret)

        console.log(`request from ${username} to join clique acknowledged`)
        if (!decoded){
            console.error("Invalid token",);
            return socket.emit("Boot Out",{message:"Please, rejoin this room"});
        }
        const name = username.toLowerCase()
        let adminId = parseInt(await redis.get('adminId')|| "2",10)
        let guestId = parseInt(await redis.get('guestId')|| "1",10)
        try {
            const roomExists = await pool.query('SELECT * FROM rooms WHERE name = $1',[cliqueName]);      
            if (roomExists.rows.length === 0){
                console.log('This room does not exist');
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
            const colorId = newUser.color_id;
            const gmExists = await pool.query('SELECT id FROM members WHERE room_id = $1 AND role = $2 ',[roomId,adminId])
            if (gmExists.rows.length === 0){
                await pool.query('UPDATE members SET role = $1 WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM members WHERE room_id = $3 and role = $1 )',[adminId,newUser.id,roomId])
            }
            const colorHexTable = await pool.query('SELECT * FROM colors WHERE id=$1',[colorId])
            const colorHex =colorHexTable.rows[0]
            console.log(`user ${name} has been added into clique ${roomName}`);
            socket.join(roomId);
            socket.emit("JoinedClique", {
                message: `Successfully joined ${roomName} `, room:roomExists.rows[0],user: newUser,colorHex
            });
            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === 2})
            return socket.to(roomId).emit("userJoined",{ message:`${username} has joined the room`,newUser,colorHex})
        }
        catch (error:any) {
            console.error("Failed to join clique",error);
            return socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
        }
    }

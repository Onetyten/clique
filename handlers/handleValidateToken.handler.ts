import dotenv from "dotenv"
dotenv.config()
import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import jwt from "jsonwebtoken"
import userRejoinSchema from "../validation/rejoinRoom.validation";
import { roleID } from "../config/role";

interface InputType{
    cliqueName:string,
    username:string,
    token:string
}

export async function handleValidateToken(socket:Socket,{cliqueName,username,token}:InputType,socketUserMap:Map<string,{userId: string; roomId: string;   isAdmin: boolean;}>){
    const secret = process.env.JWT_SECRET
    if (!secret){
        throw new Error(`No "JWT_SECRET" found in the .env file`)
    }

    const { error} = userRejoinSchema.validate({cliqueName,username,token});

    if (error){
        console.error("validation failed","Validate clique handler",error.details);
        return socket.emit("Boot Out",{message:error.message})
    }

    const decoded = jwt.verify(token,secret)  as { id: string; roomId: string }

    console.log(`validation from ${username} to join clique acknowledged`)
    

    const client = await pool.connect()

    try {
        const roomResult = await client.query(
            `SELECT id, name
            FROM rooms 
            WHERE name = $1`,
            [cliqueName]
        )

        if (roomResult.rows.length === 0) {
            return socket.emit("Boot Out", { message: "Invalid clique or token" })
        }

        const room = roomResult.rows[0]
        const roomId = room.id

        if (!decoded || decoded.roomId !== roomId) {
            console.error("Invalid token",);
            return socket.emit("Boot Out", { message: "Invalid token for this room" })
        }

       const userResult = await client.query(
            `SELECT * FROM members 
            WHERE room_id = $1 
            AND LOWER(name) = LOWER($2)`,
            [roomId, username]
        )
        if (userResult.rows.length === 0) { 
            console.log(`User ${username} not found in clique ${cliqueName}`)
            return socket.emit("Boot Out", { message: "User not found in this clique"})
        }

        console.log(`user ${username} validated`)

        return
    }
    catch (error:any) {
        console.error("Failed to join clique",error);
        return socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
    }

}

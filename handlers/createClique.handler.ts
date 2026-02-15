import dotenv from "dotenv"
dotenv.config()
import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import cliqueCreateSchema from "../validation/createRoom.validation";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { roleID } from "../config/role";
import { HexCodes } from "../config/hexCodes";
import { PoolClient } from "pg";
import { assignNextAdmin } from "../services/admin.service";

interface InputType{
    cliqueKey:string;
    cliqueName:string;
    username:string;
}


export async function handleCreateClique(socket:Socket,{cliqueKey,cliqueName,username}:InputType,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>){
        const secret = process.env.JWT_SECRET
        if (!secret){
            throw new Error(`No "JWT_SECRET" found in the .env file`)
        }
        const { error} = cliqueCreateSchema.validate({cliqueKey,cliqueName,username});
        if (error){
            console.error("validation failed","Create clique handler","\n",error.details);
            return socket.emit("Error",{message:error.message})
        }
        const client = await pool.connect()

        async function handleRoomSwitch(client:PoolClient, socket: Socket, existingUser: { userId: string; roomId: string; isAdmin: boolean },socketUserMap: Map<string, any>) {
            const { userId, roomId, isAdmin } = existingUser
            socket.leave(roomId)
            let NewAdmin;
            if (isAdmin) {
                NewAdmin = await assignNextAdmin(client,roomId,userId)
            }
            await client.query( `DELETE FROM members WHERE id = $1 AND room_id = $2`,[userId, roomId])
            socketUserMap.delete(socket.id)
            socket.to(roomId).emit("userLeft", { message:`${username} has left the clique,${NewAdmin?`The new admin is ${NewAdmin.name}`:""}`})
        }

        try {
            await client.query("BEGIN")

            let adminRoleId =  roleID.admin
            const salt = await bcrypt.genSalt(10)
            const hashedKey = await bcrypt.hash(cliqueKey,salt)
            const roomExists = await client.query('SELECT id from rooms WHERE name=$1',[cliqueName])

            if (roomExists.rows.length>0){
                await client.query("ROLLBACK")
                console.log("This Clique name has already been taken")
                return socket.emit("Error", { message: "This Clique name has already been taken" }); 
            }

            const existingUser = socketUserMap.get(socket.id)
            if (existingUser) {
                await handleRoomSwitch(client,socket, existingUser, socketUserMap)
            }

            const createdRoom = await client.query('INSERT INTO rooms (id,clique_key,name) VALUES (gen_random_uuid(),$1,$2) RETURNING * ',[hashedKey, cliqueName]);
            const roomId = createdRoom.rows[0].id;
            const roomName = createdRoom.rows[0].name;
            const savedName = username.trim().toLowerCase();
            const colorIndex = (Math.floor(Math.random() * HexCodes.length))
            const color = HexCodes[colorIndex]
            const newUserResult =  await client.query('INSERT INTO members (name, room_id, role,hex_code) VALUES ($1,$2,$3,$4) RETURNING *',[savedName,roomId,adminRoleId,color]);

            await client.query("COMMIT")
            
            const newUser = newUserResult.rows[0];
            const {was_gm,joined_at,...clientUser} = newUser
            const payload = {id:newUser.id,roomId: newUser.room_id}
            const token  = jwt.sign(payload,secret)
            const {clique_key, ...newRoom} = {...createdRoom.rows[0],token}
            socket.join(roomId);
            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === adminRoleId})
            socket.to(roomId).emit("userJoined",{ message:`${savedName} has joined the room`, savedName})
            console.log( `clique ${roomName} created by ${savedName}`);
            console.log("New room",newRoom)
            socket.emit("CliqueCreated",{message:'Clique created',room:newRoom,user:clientUser})
            return
        }
        catch (error:any) {
            await client.query("ROLLBACK")
            if (error.code === "23505") {
                console.error("This Clique name has already been taken")
                return socket.emit("Error", { message: "This Clique name has already been taken" });
            }
            console.error("Failed to create clique",error);
            return socket.emit("Error", { message: "Failed to create room due to an error, please try again" });
        }
        finally{
            client.release()
        }
    }

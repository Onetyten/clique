import dotenv from "dotenv"
dotenv.config()
import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import cliqueCreateSchema from "../validation/createRoom.validation";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { roleID } from "../config/role";
import { HexCodes } from "../config/hexCodes";



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
        try {
            let adminRoleId =  roleID.admin
            const salt = await bcrypt.genSalt(10)
            const hashedKey = await bcrypt.hash(cliqueKey,salt)
            const roomExists = await pool.query('SELECT id from rooms WHERE name=$1',[cliqueName])
            if (roomExists.rows.length>0){
                console.log("This Clique name has already been taken")
                return socket.emit("Error", { message: "This Clique name has already been taken" }); 
            }
            const createdRoom = await pool.query('INSERT INTO rooms (id,clique_key,name) VALUES (gen_random_uuid(),$1,$2) RETURNING * ',[hashedKey, cliqueName]);
            const roomId = createdRoom.rows[0].id;
            const roomName = createdRoom.rows[0].name;
            const savedName = username.trim().toLowerCase();
            const colorIndex = (Math.floor(Math.random() * HexCodes.length))
            const color = HexCodes[colorIndex]
            const newUserResult =  await pool.query('INSERT INTO members (name, room_id, role,hex_code) VALUES ($1,$2,$3,$4) RETURNING *',[savedName,roomId,adminRoleId,color]);
            const newUser = newUserResult.rows[0];
            const payload = {id:newUser.id}
            const token  = jwt.sign(payload,secret)
            const {clique_key, ...newRoom} = {...createdRoom.rows[0],token}
            socket.join(roomId);
            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === adminRoleId})
            socket.to(roomId).emit("userJoined",{ message:`${savedName} has joined the room`, savedName})
            console.log( `clique ${roomName} created by ${savedName}`);
            console.log("New room",newRoom)
            socket.emit("CliqueCreated",{message:'Clique created',room:newRoom,user:newUser})
            return
        }
        catch (error:any) {
            if (error.code === "23505") {
                console.error("This Clique name has already been taken")
                return socket.emit("Error", { message: "This Clique name has already been taken" });
            }
            console.error("Failed to create clique",error);
            return socket.emit("Error", { message: "Failed to create room due to an error, please try again" });
        }
    }

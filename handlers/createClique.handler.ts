import dotenv from "dotenv"
dotenv.config()
import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import cliqueCreateSchema from "../validation/createRoom.validation";
import redis from "../config/redisConfig";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";



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
            let adminRoleId = await redis.get("adminId")
            if (!adminRoleId){
                const adminRoleResult= await pool.query(`SELECT id FROM roles WHERE name=$1`,['admin']);
                if (adminRoleResult.rows.length > 0) {
                   await redis.set("adminId",adminRoleResult.rows[0].id)
                   console.log('Cached adminId in Redis');
                }
                else{
                socket.emit("Error",{message:'Internal server error'})
                    throw new Error("Admin role not found in roles table");
                }
                adminRoleId = adminRoleResult.rows[0].id;
            }
            const salt = await bcrypt.genSalt(10)
            const hashedKey = await bcrypt.hash(cliqueKey,salt)
            const roomExists = await pool.query('SELECT id from rooms WHERE name=$1',[cliqueName])
            if (roomExists.rows.length>0){
                return socket.emit("Error", { message: "This Clique name has already been taken" });
            }
            const createdRoom = await pool.query('INSERT INTO rooms (id,clique_key,name) VALUES (gen_random_uuid(),$1,$2) RETURNING * ',[hashedKey, cliqueName]);
            const roomId = createdRoom.rows[0].id;
            const roomName = createdRoom.rows[0].name;
            const savedName = username.trim().toLowerCase();
            const colorResult = await pool.query(`SELECT * FROM colors ORDER BY random() LIMIT 1`);
            const colorId = colorResult.rows[0].id;
            const newUserResult =  await pool.query('INSERT INTO members (name, room_id, role,color_id) VALUES ($1,$2,$3,$4) RETURNING *',[savedName,roomId,adminRoleId,colorId]);
            const newUser = newUserResult.rows[0];
            const payload = {id:newUser.id}
            const token  = jwt.sign(payload,secret)
            const {clique_key, ...newRoom} = {...createdRoom.rows[0],token}
            const colorHex =colorResult.rows[0]
            socket.join(roomId);
            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === adminRoleId})
            socket.to(roomId).emit("userJoined",{ message:`${savedName} has joined the room`, savedName})
            console.log( `clique ${roomName} created by ${savedName}`);
            console.log("New room",newRoom)
            return socket.emit("CliqueCreated",{message:'Clique created',room:newRoom,user:newUser,colorHex})
        }
        catch (error:any) {
            if (error.code === "23505") {
                return socket.emit("Error", { message: "This Clique name has already been taken" });
            }
            console.error("Failed to create clique",error);
            return socket.emit("Error", { message: "Failed to create room due to an error, please try again" });
        }
    }

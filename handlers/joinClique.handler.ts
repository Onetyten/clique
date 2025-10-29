import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import userJoinSchema from "../validation/joinRoom.validation";
import redis from "../config/redisConfig";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

interface InputType{
    cliqueKey:string,
    username:string,
    cliqueName:string;
}

export async function handleJoinClique(socket:Socket,{cliqueKey,username,cliqueName}:InputType,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>){
        const secret = process.env.JWT_SECRET
        if (!secret){
            throw new Error(`No "JWT_SECRET" found in the .env file`)
        }
        const { error} = userJoinSchema.validate({cliqueKey,username,cliqueName});
        if (error){
            console.error("validation failed","Join clique handler","\n",error.details);
            return socket.emit("Error",{message:error.message})
        }
        console.log(`request from ${username} to join clique acknowledged`)
        const name = username.toLowerCase()
        let guestId = parseInt(await redis.get('guestId')|| "1",10);
        let adminId = parseInt(await redis.get('adminId')|| "2",10)
        try {
            const roomExists = await pool.query('SELECT * FROM rooms WHERE name = $1',[cliqueName]);      
            if (roomExists.rows.length === 0){
                console.log('This room does not exist');
                return socket.emit("Error", { message: "This clique does not exist" });
            }
            const isPasswordCorrect = await bcrypt.compare(cliqueKey,roomExists.rows[0].clique_key)
            if (!isPasswordCorrect){
                console.log('Incorrect password');
                return socket.emit("Error", { message: "Incorrect key" });
            }
            let newUser;
            let colorHex;
            const roomName = roomExists.rows[0].name;
            const roomId = roomExists.rows[0].id;
            const nameExists = await pool.query('SELECT * FROM members WHERE name = $1 AND room_id = $2',[name,roomId]);
            const isSessionActive = await pool.query('SELECT is_active,end_time FROM sessions WHERE room_id=$1 AND is_active IS true',[roomId])
            if (isSessionActive.rows.length>0){
                const timeLeft = Math.floor((new Date(isSessionActive.rows[0].end_time).getTime() - Date.now())/1000)
                return socket.emit("midSessionError", { message: `A session is currently going on in room ${roomName}, rejoin in ${timeLeft}s`, timeLeft})
            }
            if (nameExists.rows.length>0){
                let connected = false
                for (const user of socketUserMap.values()){
                    if ( nameExists.rows[0].id === user.userId){
                        connected = true;
                        break;
                    }
                }
                if (connected){
                    console.log(`sorry, user ${name} already exists in this clique, please choose another name`);
                    return socket.emit("Error", { message: `user ${name} already exists in this clique choose another name` })  
                }
                else{
                    newUser = nameExists.rows[0];
                    const colorId = newUser.color_id
                    const gmExists = await pool.query('SELECT id FROM members WHERE room_id = $1 AND role = $2 ',[roomId,adminId])
                    if (gmExists.rows.length === 0){
                        await pool.query('UPDATE members SET role = $1 WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM members WHERE room_id = $3 and role = $1 )',[adminId,newUser.id,roomId])
                    }
                    const colorHexTable = await pool.query("SELECT * from colors WHERE id=$1",[colorId])
                    colorHex =colorHexTable.rows[0]
                }
            }
            else{
                const colorResult = await pool.query(`SELECT * FROM colors ORDER BY random() LIMIT 1`);
                const colorId = colorResult.rows[0].id;
                const newUserResult = await pool.query('INSERT INTO members (name, room_id, role, color_id) VALUES($1,$2,$3,$4) RETURNING *',[name,roomId,guestId,colorId]);
                newUser = newUserResult.rows[0];
                colorHex =colorResult.rows[0]
            }
            const payload = {id:newUser.id}
            const token  = jwt.sign(payload,secret)
            const {clique_key, ...newRoom} = {...roomExists.rows[0],token}
            console.log(`user ${name} has been added into clique ${roomName}`);
            socket.join(roomId.toString());
            socket.emit("JoinedClique", { message: `Successfully joined ${roomName} `, room:newRoom,user: newUser,colorHex});
            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === 2})
            return socket.to(roomId).emit("userJoined",{ message:`${username} has joined the room`,newUser,colorHex})
        }
        catch (error:any) {
            console.error("Failed to join clique",error);
            return socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
        }
    }
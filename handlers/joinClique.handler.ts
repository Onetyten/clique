import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import userJoinSchema from "../validation/joinRoom.validation";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { roleID } from "../config/role";
import { HexCodes } from "../config/hexCodes";

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
        let guestId = roleID.guest
        let adminId = roleID.admin

        async function handleRoomSwitch( socket: Socket, existingUser: { userId: string; roomId: string; isAdmin: boolean },socketUserMap: Map<string, any>) {
            const { userId, roomId, isAdmin } = existingUser
            socket.leave(roomId)

            if (isAdmin) { await reassignAdmin(roomId, userId)}

            await pool.query( "DELETE FROM members WHERE id = $1 AND room_id = $2", [userId, roomId])

            socketUserMap.delete(socket.id)
            socket.to(roomId).emit("userLeft", { message:`${username} has left the clique`})
        }


        try {
            const roomExists = await pool.query('SELECT * FROM rooms WHERE name = $1',[cliqueName]);      
            if (roomExists.rows.length === 0){
                console.log(`User ${username} tried to join inexistant room ${cliqueName}`);
                return socket.emit("Error", { message: "This clique does not exist" });
            }
            const isPasswordCorrect = await bcrypt.compare(cliqueKey,roomExists.rows[0].clique_key)
            if (!isPasswordCorrect){
                console.log('Incorrect password');
                return socket.emit("Error", { message: "Incorrect key" });
            }

            const existingUser = socketUserMap.get(socket.id)
            if (existingUser) {
                await handleRoomSwitch(socket, existingUser, socketUserMap)
            }

            let newUser;
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
                    const gmExists = await pool.query('SELECT id FROM members WHERE room_id = $1 AND role = $2 ',[roomId,adminId])
                    if (gmExists.rows.length === 0){
                        await pool.query('UPDATE members SET role = $1 WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM members WHERE room_id = $3 and role = $1 )',[adminId,newUser.id,roomId])
                    }

                }
            }
            else{
                const colorIndex = (Math.floor(Math.random() * HexCodes.length))
                const color = HexCodes[colorIndex]
                const newUserResult = await pool.query('INSERT INTO members (name, room_id, role, hex_code ) VALUES($1,$2,$3,$4) RETURNING *',[name,roomId,guestId,color]);
                newUser = newUserResult.rows[0];
            }
            const payload = {id:newUser.id}
            const token  = jwt.sign(payload,secret)
            const {clique_key, ...newRoom} = {...roomExists.rows[0],token}
            console.log(`user ${name} has been added into clique ${roomName}`);
            socket.join(roomId.toString());
            socket.emit("JoinedClique", { message: `Successfully joined ${roomName} `, room:newRoom,user: newUser});

            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === 2})


            return socket.to(roomId).emit("userJoined",{ message:`${username} has joined the room`,newUser})
        }
        catch (error:any) {
            console.error("Failed to join clique",error);
            return socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
        }
    }
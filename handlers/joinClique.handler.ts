import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import userJoinSchema from "../validation/joinRoom.validation";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { roleID } from "../config/role";
import { HexCodes } from "../config/hexCodes";
import { assignNextAdmin } from "../services/admin.service";
import { PoolClient } from "pg";
import { logger } from "../app";

interface InputType{
    cliqueKey:string,
    username:string,
    cliqueName:string;
}

export async function handleJoinClique(socket:Socket,{cliqueKey,username,cliqueName}:InputType,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>,graceTimeoutMap: Map<string, NodeJS.Timeout>){
        const secret = process.env.JWT_SECRET
        if (!secret){
            throw new Error(`No "JWT_SECRET" found in the .env file`)
        }
        const { error} = userJoinSchema.validate({cliqueKey,username,cliqueName});
        if (error){
           logger.error({error:error.details},"request validation failed",);
            return socket.emit("Error",{message:error.message})
        }
        logger.info(`request from ${username} to join clique acknowledged`)
        const name = username.toLowerCase()
        let guestId = roleID.guest
        let adminId = roleID.admin
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
            const roomExists = await client.query('SELECT * FROM rooms WHERE name = $1',[cliqueName]);      
            if (roomExists.rows.length === 0){
                await client.query("ROLLBACK")
                logger.info(`User ${username} tried to join inexistant room ${cliqueName}`);
                return socket.emit("Error", { message: "This clique does not exist" });
            }
            const isPasswordCorrect = await bcrypt.compare(cliqueKey,roomExists.rows[0].clique_key)
            if (!isPasswordCorrect){
                await client.query("ROLLBACK")
                logger.info('Incorrect password');
                return socket.emit("Error", { message: "Incorrect key" });
            }

            const existingUser = socketUserMap.get(socket.id)
            if (existingUser) {
                await handleRoomSwitch(client,socket, existingUser, socketUserMap)
            }

            let newUser;
            const roomName = roomExists.rows[0].name;
            const roomId = roomExists.rows[0].id;
            const nameExists = await client.query('SELECT * FROM members WHERE name = $1 AND room_id = $2',[name,roomId]);
            const isSessionActive = await client.query('SELECT is_active,end_time FROM sessions WHERE room_id=$1 AND is_active IS true',[roomId])

            if (isSessionActive.rows.length>0){
                await client.query("COMMIT")
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
                    await client.query("COMMIT")
                    logger.info(`sorry, user ${name} already exists in this clique, please choose another name`);
                    return socket.emit("Error", { message: `user ${name} already exists in this clique choose another name` })  
                }
                else{

                    newUser = nameExists.rows[0];
                    const graceKey = `${newUser.id}:${roomId}`
                    const pendingTimeout = graceTimeoutMap.get(graceKey)
                    if (pendingTimeout) {
                        clearTimeout(pendingTimeout)
                        graceTimeoutMap.delete(graceKey)
                        logger.info(`Cancelled grace timeout for rejoining user ${name}`)
                    }
                    const gmExists = await client.query('SELECT id FROM members WHERE room_id = $1 AND role = $2 ',[roomId,adminId])
                    if (gmExists.rows.length === 0){
                        await client.query('UPDATE members SET role = $1 WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM members WHERE room_id = $3 and role = $1 )',[adminId,newUser.id,roomId])
                    }
                }
            }

            else {
                const colorIndex = (Math.floor(Math.random() * HexCodes.length))
                const color = HexCodes[colorIndex]
                const newUserResult = await client.query('INSERT INTO members (name, room_id, role, hex_code ) VALUES($1,$2,$3,$4) RETURNING *',[name,roomId,guestId,color]);
                newUser = newUserResult.rows[0];
            }

            await client.query("COMMIT")
            
            const {was_gm,joined_at,...clientUser} = newUser
            const payload = {id:newUser.id,roomId: newUser.room_id}
            const token  = jwt.sign(payload,secret)
            const {clique_key,...newRoom} = {...roomExists.rows[0],token}
            logger.info(`user ${name} has been added into clique ${roomName}`);
            socket.join(roomId.toString());
            socket.emit("JoinedClique", { message: `Successfully joined ${roomName} `, room:newRoom,user: clientUser});

            socketUserMap.set(socket.id,{userId:newUser.id,roomId,isAdmin:newUser.role === 2})
            return socket.to(roomId).emit("userJoined",{ message:`${username} has joined the room`,user:clientUser})
        }
        catch (error:any) {
            await client.query("ROLLBACK")
            logger.error("Failed to join clique",error);
            return socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
        }
        finally {
            client.release()
        }
    }
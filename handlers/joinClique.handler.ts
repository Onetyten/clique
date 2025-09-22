import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import userJoinSchema from "../validation/joinRoom.validation";
import redis from "../config/redisConfig";


interface InputType{
    cliqueKey:string,
    username:string,
    isFirstConn:boolean
}

export async function handleJoinClique(socket:Socket,{cliqueKey,username,isFirstConn}:InputType,socketUserMap:Map<string,{userId: string; roomId: string;
isAdmin: boolean;}>){

        const { error} = userJoinSchema.validate({cliqueKey,username,isFirstConn});
        if (error){
            console.error("validation failed",error.details);
            return socket.emit("Error",{
            message:'Invalid input'})
        }
        console.log(`request from ${username} to join clique acknowledged`)
        const name = username.toLowerCase()
        let adminId = parseInt(await redis.get('adminId')|| "2",10)
        let guestId = parseInt(await redis.get('guestId')|| "1",10)
        try {
            const roomExists = await pool.query('SELECT * FROM rooms WHERE clique_key = $1',[cliqueKey]);      
            if (roomExists.rows.length === 0){
                console.log('This room does not exist');
                return socket.emit("Error", { message: "This clique does not exist" });
            }
            
            const roomName = roomExists.rows[0].name
            const roomId = roomExists.rows[0].id;
            let newUser;
            let colorId = 1
            if (isFirstConn){
                const nameExists = await pool.query('SELECT name FROM members WHERE name = $1 AND room_id = $2',[name,roomId]);
                if (nameExists.rows.length>0){
                console.log(`sorry, user ${name} already exists in this clique, please choose another name`);
                return socket.emit("Error", { message: `user ${name} already exists in this clique choose another name` })}
                const isSessionActive = await pool.query('SELECT is_active,end_time FROM sessions WHERE room_id=$1 AND is_active IS true',[roomId])
                if (isSessionActive.rows.length>0){
                    const timeLeft = Math.floor((isSessionActive.rows[0].end_time - Date.now())/1000)
                    return socket.emit("midSessionError", { message: `A session is currently going on in room ${roomName}, rejoin in ${timeLeft}s`, timeLeft})
                }
            
                if (!guestId){
                    const guestRoleResult= await pool.query('SELECT id FROM roles WHERE name=$1',['guest']);
                    if (guestRoleResult.rows.length > 0) {
                        await redis.set("guestId",guestRoleResult.rows[0].id)
                        console.log('Cached guestId in Redis');
                    }
                    else{
                        socket.emit("Error",{message:'Internal server error'})
                         throw new Error("Guest role not found in roles table");
                    }
                    guestId = guestRoleResult.rows[0].id;
                }
                const colorResult = await pool.query(`SELECT id FROM colors ORDER BY random() LIMIT 1`);
                colorId = colorResult.rows[0].id;
                const newUserResult = await pool.query('INSERT INTO members (name, room_id, role, color_id) VALUES($1,$2,$3,$4) RETURNING *',[name,roomId,guestId,colorId]);
                newUser = newUserResult.rows[0];
            }
            else
            {
                const existingUser = await pool.query('SELECT * FROM members WHERE name = $1 AND room_id = $2', [name, roomId]);
                newUser = existingUser.rows[0];
                colorId = newUser.color_id
                const gmExists = await pool.query('SELECT id FROM members WHERE room_id = $1 AND role = $2 ',[roomId,adminId])
                if (gmExists.rows.length === 0){
                    await pool.query('UPDATE members SET role = $1 WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM members WHERE room_id = $3 and role = $1 )',[adminId,newUser.id,roomId])
                }
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

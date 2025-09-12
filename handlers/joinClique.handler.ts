import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import userJoinSchema from "../validation/joinRoom.validation";


interface InputType{
    cliqueKey:string,
    username:string,
    isFirstConn:boolean
}

export async function handleJoinClique(socket:Socket,{cliqueKey,username,isFirstConn}:InputType){
        const { error} = userJoinSchema.validate({cliqueKey,username,isFirstConn});
        if (error){
            console.error("validation failed",error.details);
            return socket.emit("Error",{
            message:'Invalid input'})
        }
        console.log(`request from ${username} to join clique acknowledged`)
        const name = username.toLowerCase()

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
                const guestRoleResult= await pool.query('SELECT id FROM roles WHERE name=$1',['guest']);
                if (guestRoleResult.rows.length === 0) {
                    throw new Error("Guest role not found in roles table");
                }
                const guestRoleId = guestRoleResult.rows[0].id;
                const colorResult = await pool.query(`SELECT id FROM colors ORDER BY random() LIMIT 1`);
                colorId = colorResult.rows[0].id;
                const newUserResult = await pool.query('INSERT INTO members (name, room_id, role, color_id) VALUES($1,$2,$3,$4) RETURNING *',[name,roomId,guestRoleId,colorId]);
                newUser = newUserResult.rows[0];
            }
            else
            {
                const existingUser = await pool.query('SELECT * FROM members WHERE name = $1 AND room_id = $2', [name, roomId]);
                newUser = existingUser.rows[0];
                colorId = newUser.color_id
            }
            const colorHexTable = await pool.query('SELECT * FROM colors WHERE id=$1',[colorId])
            const colorHex =colorHexTable.rows[0]
            console.log(`user ${name} has been added into clique ${roomName}`);
            socket.join(roomId);
            socket.emit("JoinedClique", {
                message: `Successfully joined ${roomName} `, room:roomExists.rows[0],user: newUser,colorHex
            });
            socket.to(roomId).emit("userJoined",{ message:`${username} has joined the room`,newUser,colorHex})
        }
        catch (error:any) {
            console.error("Failed to join clique",error);
            socket.emit("Error", { message: "Failed to join clique due to an error, please try again" });
        }

    }

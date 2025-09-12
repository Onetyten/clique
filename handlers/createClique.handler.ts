import { Socket } from "socket.io";
import pool from "../config/pgConnect";
import cliqueCreateSchema from "../validation/createRoom.validation";

interface InputType{
    cliqueKey:string,
    cliqueName:string,
    username:string
}

export async function handleCreateClique(socket:Socket,{cliqueKey,cliqueName,username}:InputType){
        const { error} = cliqueCreateSchema.validate({cliqueKey,cliqueName,username});
        if (error){
            console.error("validation failed",error.details);
            return socket.emit("Error",{
            message:'Invalid input'})
        }
        try {
            const adminRoleResult= await pool.query(`
            SELECT id FROM roles
            WHERE name=$1`,['admin']);
            if (adminRoleResult.rows.length === 0) {
                throw new Error("Admin role not found in roles table");
            }
            const adminRoleId = adminRoleResult.rows[0].id;
            const createdRoom = await pool.query('INSERT INTO rooms (id,clique_key,name) VALUES (gen_random_uuid(),$1,$2) RETURNING * ',[cliqueKey, cliqueName]);
            const roomId = createdRoom.rows[0].id;
            const roomName = createdRoom.rows[0].name;
            const savedName = username.trim().toLowerCase();
            const colorResult = await pool.query(`SELECT id FROM colors ORDER BY random() LIMIT 1`);
            const colorId = colorResult.rows[0].id;
            const newUserResult =  await pool.query('INSERT INTO members (name, room_id, role,color_id) VALUES ($1,$2,$3,$4) RETURNING *',[savedName,roomId,adminRoleId,colorId]);
            const newUser = newUserResult.rows[0];
            const colorHexTable = await pool.query('SELECT * FROM colors WHERE id=$1',[colorId])
            const colorHex =colorHexTable.rows[0]
            socket.join(roomId);
            socket.to(roomId).emit("userJoined",{ message:`${savedName} has joined the room`, savedName})
            console.log( `clique ${roomName} created by ${savedName}`);
            return socket.emit("CliqueCreated",{message:'Clique created',room:createdRoom.rows[0],user:newUser,colorHex})
        }
        catch (error:any) {
            if (error.code === "23505") {
                return socket.emit("Error", { message: "This key has already been taken" });
            }
            console.error("Failed to create clique",error);
            socket.emit("Error", { message: "Failed to create room due to an error, please try again" });
        }
    }

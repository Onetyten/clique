import { Request, Response } from "express"
import pool from "../config/pgConnect"


export async function CreateRoomController(req:Request,res:Response) {
    const {name}= req.body
    if (!name || name.length==0){
        console.log("invalid input")
        return res.status(400).json({message:"invalid input",success:false})
    }
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const adminRoleResult= await client.query(`
            SELECT id FROM roles
            WHERE name=$1`,['admin']);
        const adminRoleId = adminRoleResult.rows[0].id;
        const createdRoom = await client.query('INSERT INTO rooms (id) VALUES (gen_random_uuid()) RETURNING id,index');
        const roomId = createdRoom.rows[0].id;
        const roomIndex = createdRoom.rows[0].index;
        const savedName = name.toLowerCase();
        const newUserResult =  await client.query('INSERT INTO members (name, room_id, role) VALUES ($1,$2,$3) RETURNING *',[savedName,roomId,adminRoleId]);
        const newUser = newUserResult.rows[0];
        console.log( `room ${roomIndex} created by ${savedName}`);
        await client.query('COMMIT');
        return res.status(201).json({message: `room ${roomIndex} created by ${savedName} sucessfully`,success:true ,room:{id:roomId, index:roomIndex, admin:savedName}, user:newUser }) 
    } 
    catch (error) {
        await client.query('ROLLBACK') 
        console.error("Failed to create clique", error);
        return res.status(500).json({ message: "Failed to create room due to a server error.",error : error instanceof Error?error.message:'internal server error' , success: false});
    }
    finally
    {
       client.release()
    }
}

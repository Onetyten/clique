import { Request, Response } from "express";
import pool from "../config/pgConnect";
import userJoinSchema from "../validation/joinRoom.validation";



export async function JoinRoomController(req:Request, res:Response) {
    const {error, value} = userJoinSchema.validate(req.body);
    if (error){
        console.error("validation failed",error.details);
        return res.status(400).json({message:'Validation failed invalid input', error: error.details.map(detail=>detail.message)});
    }
    const {username, roomIndex} = value;
    const name = username.toLowerCase()
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const roomExists = await client.query('SELECT * FROM rooms WHERE index = $1',[roomIndex]);      
        if (roomExists.rows.length === 0){
            console.log('This room does not exist');
            return res.status(404).json({message:'This room does not exist',success:false});
        }
        const roomId = roomExists.rows[0].id;

        const nameExists = await client.query('SELECT name FROM members WHERE name = $1 AND room_id = $2',[name,roomId]);
        if (nameExists.rows.length>0){
            console.log(`sorry, user ${name} already exists in this clique choose another name`);
            return res.status(400).json({message:`user ${name} already exists in this clique choose another name`,success:false});
        }
        const guestRoleResult= await client.query('SELECT id FROM roles WHERE name=$1',['guest']);
        const guestRoleId = guestRoleResult.rows[0].id;
        const newUserResult = await client.query('INSERT INTO members (name, room_id, role) VALUES($1,$2,$3) RETURNING *',[name,roomId,guestRoleId]);
        const newUser = newUserResult.rows[0]
        console.log(`user ${name} has been added into room ${roomIndex}`);
        await client.query('COMMIT');
        return res.status(201).json({message:`user ${name} has been added into room ${roomIndex}`,room:{id:roomId, index:roomIndex},user:newUser,success:true});
    }
    catch (error) {
        await client.query('ROLLBACK')
        console.error(`Failed to join room ${roomIndex}`, error);
        return res.status(500).json({ message: "Failed to join room due to a server error.",error : error instanceof Error?error.message:'internal server error' , success: false});      
    }
    finally{
       client.release() 
    }
    
}
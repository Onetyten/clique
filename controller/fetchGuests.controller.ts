import { Request, Response } from "express";
import Joi from "joi";
import pool from "../config/pgConnect";

const getGuestSchema = Joi.object({
    roomName: Joi.string().min(3).max(50).required()
}).options({abortEarly:false})


export async function fetchGuests(req:Request,res:Response) {
    console.log("member fetch acknowledged")
    const {error,value} = getGuestSchema.validate(req.params)
    if (error){
        console.error("validation failed",error.details);
        return res.status(400).json({message:'Invalid clique number provided', error: error.details.map(detail=>detail.message)});
    }
    console.log("Room name from params:", req.params.roomName);
    const {roomName} = value
    
    try{
        const memberTable = await pool.query(`SELECT m.*,
            FROM members m INNER JOIN rooms r ON m.room_id = r.id
            WHERE r.name = $1`,
        [roomName])
        if (memberTable.rows.length==0){
            console.log('There is no one in this clique')
            return res.status(404).json({message:'There is no one in this clique'})
        }
        return res.status(200).json({message:`members of clique ${roomName} fetched successfully`,members:memberTable.rows})
    }
    catch (error) {
        console.error(`Failed to get ${roomName} members`, error);
        return res.status(500).json({ message: "Failed to get clique members due to a server error.",error : error instanceof Error?error.message:'internal server error' , success: false});      
    }
}
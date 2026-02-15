import { Request, Response } from "express";
import Joi from "joi";
import pool from "../config/pgConnect";
import { logger } from "../app";

const getGuestSchema = Joi.object({
    roomId: Joi.string().required()
}).options({abortEarly:false})


export async function fetchGuests(req:Request,res:Response) {
    logger.info("member fetch acknowledged")
    const {error,value} = getGuestSchema.validate(req.params)
    if (error){
        logger.error({error:error.details},"request validation failed");
        return res.status(400).json({message:'Invalid clique number provided', error: error.details.map(detail=>detail.message)});
    }

    const {roomId} = value
    
    try{
        const memberTable = await pool.query(
            `SELECT
            id,
            name,
            room_id,
            role,
            hex_code,
            score
            FROM members
            WHERE room_id = $1`,
        [roomId])
        if (memberTable.rows.length==0){
            logger.info('There is no one in this clique')
            return res.status(404).json({message:'There is no one in this clique'})
        }
        return res.status(200).json({message:`members of clique ${roomId} fetched successfully`,members:memberTable.rows})
    }
    catch (error) {
        logger.error({error},`Failed to get ${roomId} members`);
        return res.status(500).json({ message: "Failed to get clique members due to a server error.",error : error instanceof Error?error.message:'internal server error' , success: false});      
    }
}
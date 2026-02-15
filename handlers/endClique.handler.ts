import { logger } from "../app";
import pool from "../config/pgConnect";

export async function scorchedEarth(roomId:string) {
    try {
        await pool.query('DElETE FROM sessions WHERE room_id = $1',[roomId])
        await pool.query('DElETE FROM members WHERE room_id = $1',[roomId])
        await pool.query('DElETE FROM rooms WHERE id = $1',[roomId])
        logger.info(`Room ${roomId} cleaned up from the Database`)
    }
    catch (error) {
        logger.error({error},"Cleanup failed:",);
    }
}
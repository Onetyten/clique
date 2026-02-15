import { logger } from "../app";
import pool from "../config/pgConnect";
import redis from "../config/redisConfig";

export async function CacheRoleIDs() {
    try {
        const adminRoleResult = await pool.query('SELECT id FROM roles WHERE name=$1',['admin'])
        const guestRoleResult = await pool.query('SELECT id FROM roles WHERE name=$1',['guest'])
        if (adminRoleResult.rows.length>0){
            await redis.set('adminId',adminRoleResult.rows[0].id)
            logger.info('Cached adminId in Redis');
        }
        if(guestRoleResult.rows.length>0){
            await redis.set('guestId',guestRoleResult.rows[0].id)
             logger.info('Cached guestId in Redis');
        }
    }
    catch (error) {
         logger.error({error:error},'Error caching role IDs');
    }
    
}

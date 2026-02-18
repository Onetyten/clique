import { logger } from "../app"
import pool from "../config/pgConnect"

export async function startupCleanup() {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        const deletedRooms = await client.query(`DELETE FROM rooms RETURNING id, name`)

        if (deletedRooms.rows.length === 0) {
            logger.info("Startup cleanup: no stale rooms found")
            await client.query("COMMIT")
            return
        }

        logger.info(`Startup cleanup: purged ${deletedRooms.rows.length} stale rooms`)
        await client.query("COMMIT")
    }
    catch (err) {
        await client.query("ROLLBACK")
        logger.error(`Startup cleanup failed: ${err}`)
    }
    finally {
        client.release()
    }
}
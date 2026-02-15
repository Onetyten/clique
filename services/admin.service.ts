import { PoolClient } from "pg"
import pool from "../config/pgConnect"
import { roleID } from "../config/role"

export async function assignNextAdmin(client:PoolClient,roomId: string,excludeUserId: string) {

  const guestID = Number(roleID.guest)
  const adminID = Number(roleID.admin)


  let newAdminResult = await client.query( 
    `
    SELECT * FROM members 
    WHERE room_id = $1 AND was_gm IS false
    AND id != $2
    ORDER BY RANDOM() 
    LIMIT 1`,
    [roomId,excludeUserId]
  )

  if (newAdminResult.rows.length === 0) {
    await client.query(
    `UPDATE members SET was_gm = false
      WHERE room_id = $1`,
      [roomId]
    )

    newAdminResult = await client.query(
      `SELECT * FROM members 
       WHERE room_id = $1
       AND id != $2
       ORDER BY RANDOM() 
       LIMIT 1`,
      [roomId,excludeUserId]
    )
  }

  if (newAdminResult.rows.length === 0) {
    return null
  }

  const newAdmin = newAdminResult.rows[0]
  await client.query(
    `UPDATE members
    SET role = CASE WHEN id = $1 THEN $2::smallint ELSE $3::smallint END,
    was_gm = CASE WHEN id = $1 THEN true ELSE was_gm END
    WHERE room_id = $4`,
    [newAdmin.id, adminID, guestID, roomId]
  )

  return newAdmin
}
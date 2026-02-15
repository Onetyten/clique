import { Pool } from "pg";
import dotenv from 'dotenv';
import { logger } from "../app";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: true },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err, client) => {
  logger.error({error:err},'Unexpected error on idle client',);
});

export default pool;
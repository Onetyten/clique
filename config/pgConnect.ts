import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
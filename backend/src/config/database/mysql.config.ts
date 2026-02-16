import mysql from "mysql2/promise";
import { env } from "../env/env.config.js";
import { logger } from "../../shared/utils/logger.js";

export const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    logger.info("MySQL connection established");
    connection.release();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

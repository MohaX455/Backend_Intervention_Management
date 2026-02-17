import { pool } from "../../src/config/database/mysql.config";

export const resetDatabase = async () => {
  await pool.execute("DELETE FROM users");
};

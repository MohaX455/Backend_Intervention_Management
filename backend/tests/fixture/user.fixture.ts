import bcrypt from "bcryptjs";
import { pool } from "../../src/config/database/mysql.config";

export const createTestUser = async () => {
  const hashed = await bcrypt.hash("Password123", 10);

  await pool.execute(
    "INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)",
    ["testuser", "test@example.com", hashed, 1]
  );
};

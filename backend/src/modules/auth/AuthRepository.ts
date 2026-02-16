// AuthRepository.ts
import { pool } from "../../config/database/mysql.config.js";
import { UserRow } from "./auth.types.js";

export class AuthRepository {
  async findByName(name: string): Promise<UserRow | null> {
    const [rows] = await pool.execute<UserRow[]>(
      "SELECT * FROM users WHERE username = ?",
      [name]
    );
    return rows[0] || null;
  }
}

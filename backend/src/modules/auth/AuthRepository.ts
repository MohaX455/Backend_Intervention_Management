// AuthRepository.ts
import { pool } from "../../config/database/mysql.config.js";
import { UserRow } from "./auth.types.js";

export class AuthRepository {
    async findByEmail(email: string): Promise<UserRow | null> {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, email, password, role_id FROM users WHERE email = ?',
            [email]
        )
        return rows[0] || null
    }
}

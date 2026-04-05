// AuthRepository.ts
import { pool } from "../../config/database/mysql.config.js";
import { UserRow } from "../../types/user.types.js";
import { ResultSetHeader } from "mysql2";

export class AuthRepository {
    findByEmail = async (email: string): Promise<UserRow | null> => {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, username AS name, email, password, role_id, status FROM users WHERE email = ?',
            [email]
        )
        return rows[0] || null
    }

    findById = async (id: number): Promise<UserRow | null> => {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, username AS name, email, role_id, status FROM users WHERE id = ?',
            [id]
        )
        return rows[0] || null
    }

    findByToken = async (token: string): Promise<UserRow | null> => {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, invitation_expires_at FROM users WHERE invitation_token = ?',
            [token]
        )
        return rows[0] || null
    }

    setPassword = async (userId: number, password: string): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET password = ?, status = "Active", invitation_token = NULL, invitation_expires_at = NULL WHERE id = ?',
            [password, userId]
        )
        return result.affectedRows
    }

    updateProfile = async (userId: number, password?: string): Promise<number> => {
        let query = 'UPDATE users SET ';
        const params: any[] = [];
        const updates: string[] = [];

        if (password) {
            updates.push('password = ?');
            params.push(password);
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(userId);

        const [result] = await pool.execute<ResultSetHeader>(query, params);
        return result.affectedRows;
    }
}

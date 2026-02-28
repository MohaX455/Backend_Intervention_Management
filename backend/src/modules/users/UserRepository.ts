import { pool } from '../../config/database/mysql.config.js'
import { UserRow } from '../../types/user.types.js'
import { ResultSetHeader } from 'mysql2'

export class UserRepository {
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

    createUser = async (name: string, email: string, roleId: number, invitationToken: string, invitationExpiresAt: Date): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (username, email, role_id, invitation_token, invitation_expires_at) VALUES (?, ?, ?, ?, ?)',
            [name, email, roleId, invitationToken, invitationExpiresAt]
        )
        return result.insertId
    }

    getUsers = async (): Promise<UserRow[]> => {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, username AS name, email, role_id, status FROM users WHERE role_id in (2, 3) ORDER BY id DESC LIMIT 7'
        )
        return rows
    }

    updateUser = async (id: number, name: string, email: string, roldeId: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET username = ?, email = ?, role_id = ? WHERE id = ?',
            [name, email, roldeId, id]
        )
        return result.affectedRows
    }

    deleteUser = async (id: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [id]
        )
        return result.affectedRows
    }
}
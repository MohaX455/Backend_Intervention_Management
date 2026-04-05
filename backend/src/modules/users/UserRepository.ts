import { pool } from '../../config/database/mysql.config.js'
import { UserRow } from '../../types/user.types.js'
import { ResultSetHeader } from 'mysql2'

export class UserRepository {
    findByEmail = async (email: string): Promise<UserRow | null> => {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, username AS name, email, password, role_id, status, invitation_token, invitation_expires_at FROM users WHERE email = ?',
            [email]
        )
        return rows[0] || null
    }

    findById = async (id: number): Promise<UserRow | null> => {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, username AS name, email, role_id, status, invitation_token, invitation_expires_at FROM users WHERE id = ?',
            [id]
        )
        return rows[0] || null
    }

    createUser = async (name: string, email: string, roleId: number, invitationToken: string, invitationExpiresAt: Date, status = 'Invited'): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (username, email, role_id, status, invitation_token, invitation_expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, roleId, status, invitationToken, invitationExpiresAt]
        )
        return result.insertId
    }

    updateInvitationToken = async (id: number, invitationToken: string | null, invitationExpiresAt: Date | null): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET invitation_token = ?, invitation_expires_at = ? WHERE id = ?',
            [invitationToken, invitationExpiresAt, id]
        )
        return result.affectedRows
    }

    updateUserStatus = async (id: number, status: string): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        )
        return result.affectedRows
    }

    createClientUser = async (
        connection: any,
        username: string,
        email: string,
        roleId: number,
        status: string
    ): Promise<number> => {

        const [result] = await connection.execute(
            `INSERT INTO users (username, email, role_id, status) VALUES (?, ?, ?, ?)`,
            [username, email, roleId, status]
        ) as [ResultSetHeader, any]

        return result.insertId
    }

    getUsers = async (): Promise<UserRow[]> => {
        const [rows] = await pool.execute<UserRow[]>(
            'SELECT id, username AS name, email, role_id, status FROM users WHERE role_id IN (2, 3) ORDER BY id DESC'
        )
        return rows
    }

    updateUser = async (id: number, name: string, email: string, roleId: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE users SET username = ?, email = ?, role_id = ? WHERE id = ?',
            [name, email, roleId, id]
        )
        return result.affectedRows
    }

    updateUserWithConnection = async (
        connection: any,
        id: number,
        name?: string,
        email?: string
    ) => {
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('username = ?');
            values.push(name);
        }

        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }

        if (updates.length === 0) {
            return; // Nothing to update
        }

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);

        await connection.execute(query, values);
    }

    updateUserStatusWithConnection = async (
        connection: any,
        id: number,
        status: string
    ) => {

        await connection.execute(
            `UPDATE users SET status = ? WHERE id = ?`,
            [status, id]
        )
    }

    deleteUser = async (id: number): Promise<number> => {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        ) as [ResultSetHeader, any];
        return result.affectedRows
    }

    deleteUserWithConnection = async (connection: any, id: number) => {
        const [result] = await connection.execute(
            `DELETE FROM users WHERE id = ?`,
            [id]
        ) as [ResultSetHeader, any];
        return result.affectedRows
    }
}
import { pool } from '../../config/database/mysql.config.js'
import { ResultSetHeader } from 'mysql2'

export class ClientRepository {

    createClient = async (
        connection: any,
        userId: number,
        client_type: 'individual' | 'company',
        phone: string,
        address: string,
        createdBySecretaryId: number
    ): Promise<void> => {

        const [result] = await connection.execute(
            `INSERT INTO clients (user_id, client_type, phone, address, created_by) VALUES (?, ?, ?, ?, ?)`,
            [userId, client_type, phone, address, createdBySecretaryId]
        ) as [ResultSetHeader, any];
    }

    getClients = async (limit?: number) => {
        let query = `
        SELECT u.id, u.username, u.email, c.client_type, c.phone, c.address, c.created_by
        FROM clients c
        JOIN users u ON u.id = c.user_id
        ORDER BY u.id DESC
        `;

        if (limit && !isNaN(limit) && limit > 0) {
            query += ` LIMIT ${Number(limit)}`;
        }
        const [rows] = await pool.execute(query);
        return rows;
    };

    getClientById = async (id: number) => {
        const [rows]: any = await pool.execute(
            `SELECT u.id, u.username, u.email, u.status, c.client_type, c.phone, c.address, c.created_by
             FROM clients c
             JOIN users u ON u.id = c.user_id
             WHERE u.id = ?`,
            [id]
        )
        return rows[0] || null
    }


    updateClientWithConnection = async (
        connection: any,
        id: number,
        client_type?: string,
        phone?: string,
        address?: string
    ) => {
        const updates = [];
        const values = [];

        if (client_type !== undefined) {
            updates.push('client_type = ?');
            values.push(client_type);
        }

        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (address !== undefined) {
            updates.push('address = ?');
            values.push(address);
        }

        if (updates.length === 0) {
            return; // Nothing to update
        }

        const query = `UPDATE clients SET ${updates.join(', ')} WHERE user_id = ?`;
        values.push(id);

        await connection.execute(query, values);
    }

    deleteClientWithConnection = async (connection: any, id: number) => {
        const [result] = await connection.execute(
            `DELETE FROM clients WHERE user_id = ?`,
            [id]
        ) as [ResultSetHeader, any];
        return result.affectedRows
    }
}
import { pool } from '../../config/database/mysql.config.js'
import { ResultSetHeader } from 'mysql2'

export class ClientRepository {

    createClient = async (
        connection: any,
        userId: number,
        client_type: 'individual' | 'company',
        phone: string,
        address: string
    ): Promise<void> => {

        const [result] = await connection.execute(
            `INSERT INTO clients (user_id, client_type, phone, address) VALUES (?, ?, ?, ?)`,
            [userId, client_type, phone, address]
        ) as [ResultSetHeader, any];
    }

    getClients = async (limit?: number) => {
        let query = `
        SELECT u.id, u.username, u.email, c.client_type, c.phone, c.address
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
            `SELECT u.id, u.username, u.email, u.status, c.client_type, c.phone, c.address
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
        client_type: string,
        phone: string,
        address: string
    ) => {

        await connection.execute(
            `UPDATE clients SET client_type = ?, phone = ?, address = ? WHERE user_id = ?`,
            [client_type, phone, address, id]
        )
    }

    deleteClientWithConnection = async (connection: any, id: number) => {
        const [result] = await connection.execute(
            `DELETE FROM clients WHERE user_id = ?`,
            [id]
        ) as [ResultSetHeader, any];
        return result.affectedRows
    }
}
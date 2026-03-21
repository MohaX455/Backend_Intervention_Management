import { pool } from '../../config/database/mysql.config.js'
import { ResultSetHeader } from 'mysql2'

export class ClientRepository {

    createClient = async (
        connection: any,
        userId: number,
        clientType: 'individual' | 'company',
        phone: string,
        address: string
    ): Promise<void> => {

        const [result] = await connection.execute(
            `INSERT INTO clients (user_id, client_type, phone, address) VALUES (?, ?, ?, ?)`,
            [userId, clientType, phone, address]
        ) as [ResultSetHeader, any];
    }

    getClients = async () => {
        const [rows] = await pool.execute(
            `SELECT u.id, u.username, u.email, c.client_type, c.phone, c.address
             FROM clients c
             JOIN users u ON u.id = c.user_id
             ORDER BY u.id DESC`
        )
        return rows
    }

    findClientById = async (id: number) => {
        const [rows]: any = await pool.execute(
            `SELECT u.id, u.username, u.email, c.client_type, c.phone, c.address
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
        clientType: string,
        phone: string,
        address: string
    ) => {

        await connection.execute(
            `UPDATE clients SET client_type = ?, phone = ?, address = ? WHERE user_id = ?`,
            [clientType, phone, address, id]
        )
    }

    deleteClient = async (id: number) => {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE users SET status = 'Inactive' WHERE id = ?`,
            [id]
        )
        return result.affectedRows
    }
}
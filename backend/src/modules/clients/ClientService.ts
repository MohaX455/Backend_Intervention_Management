import { ClientRepository } from './ClientRepository.js';
import { UserRepository } from "../users/UserRepository.js";
import { pool } from "../../config/database/mysql.config.js";

export class ClientService {
    constructor(
        private clientRepo: ClientRepository,
        private userRepo: UserRepository
    ) { }

    // CREATE CLIENT (transaction)
    createClient = async (
        name: string,
        email: string,
        clientType: 'individual' | 'company',
        phone: string,
        address: string
    ) => {

        if (!name || !email || !clientType || !phone || !address) {
            throw new Error('All fields are required')
        }

        const clientRoleId = 4
        const status = 'Active'

        const lowerEmail = email.toLowerCase()

        const existingUser = await this.userRepo.findByEmail(lowerEmail)
        if (existingUser) {
            throw new Error('Client already exists')
        }

        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            // ✅ maintenant via repo
            const userId = await this.userRepo.createClientUser( connection, name, lowerEmail, clientRoleId, status )

            await this.clientRepo.createClient( connection, userId, clientType, phone, address )

            const data = { userId, name, email: lowerEmail, status }

            await connection.commit()

            return { data }

        } catch (err) {
            await connection.rollback()
            throw err
        } finally {
            connection.release()
        }
    }

    getClients = async () => {
        return await this.clientRepo.getClients()
    }

    updateClient = async (
        id: number,
        name: string,
        email: string,
        clientType: string,
        phone: string,
        address: string
    ) => {

        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            await this.userRepo.updateUserWithConnection( connection, id, name, email )

            await this.clientRepo.updateClientWithConnection( connection, id, clientType, phone, address )

            await connection.commit()

        } catch (err) {
            await connection.rollback()
            throw err
        } finally {
            connection.release()
        }
    }

    deleteClient = async (id: number) => {
        await this.clientRepo.deleteClient(id)
    }
}
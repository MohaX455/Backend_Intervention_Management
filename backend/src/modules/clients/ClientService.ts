import { ClientRepository } from './ClientRepository.js';
import { UserRepository } from "../users/UserRepository.js";
import { pool } from "../../config/database/mysql.config.js";
import { logger } from "../../shared/utils/logger.js";

export class ClientService {
    constructor(
        private clientRepo: ClientRepository,
        private userRepo: UserRepository
    ) { }

    // CREATE CLIENT (transaction)
    createClient = async (
        name: string,
        email: string,
        client_type: 'individual' | 'company',
        phone: string,
        address: string,
        secretaryId: number,
        requestId = "client-create-no-request-id"
    ) => {
        logger.info({
            context: "clients.create.service.start",
            requestId,
            payload: { name, email, client_type, phone, address, secretaryId }
        }, "Client create service started");

        if (!name || !email || !client_type || !phone || !address || !secretaryId) {
            logger.warn({
                context: "clients.create.service.validation_failed",
                requestId
            }, "Client create validation failed: missing required fields");
            throw new Error('All fields are required')
        }

        const clientRoleId = 4
        const status = 'Active'

        const lowerEmail = email.toLowerCase()

        const existingUser = await this.userRepo.findByEmail(lowerEmail)
        if (existingUser) {
            logger.warn({
                context: "clients.create.service.duplicate_email",
                requestId,
                email: lowerEmail
            }, "Client create rejected: email already exists");
            throw new Error('Client already exists')
        }

        const connection = await pool.getConnection()
        logger.debug({
            context: "clients.create.service.db_connection_opened",
            requestId
        }, "Database connection opened for client creation");

        try {
            await connection.beginTransaction()
            logger.debug({
                context: "clients.create.service.transaction_started",
                requestId
            }, "Client create transaction started");

            const userId = await this.userRepo.createClientUser(connection, name, lowerEmail, clientRoleId, status)
            logger.info({
                context: "clients.create.service.user_inserted",
                requestId,
                userId
            }, "User row inserted for new client");

            await this.clientRepo.createClient(connection, userId, client_type, phone, address, secretaryId)
            logger.info({
                context: "clients.create.service.client_inserted",
                requestId,
                userId
            }, "Client row inserted");

            const data = { id: userId, name, email: lowerEmail, phone, client_type, address, status, created_by: secretaryId }

            await connection.commit()
            logger.info({
                context: "clients.create.service.transaction_committed",
                requestId,
                createdClientId: userId
            }, "Client create transaction committed");

            return data

        } catch (err: any) {
            await connection.rollback()
            logger.error({
                context: "clients.create.service.transaction_rolled_back",
                requestId,
                errorMessage: err?.message ?? String(err),
                errorStack: err?.stack
            }, "Client create transaction rolled back");
            throw err
        } finally {
            connection.release()
            logger.debug({
                context: "clients.create.service.db_connection_released",
                requestId
            }, "Database connection released for client creation");
        }
    }

    getClients = async () => {
        return await this.clientRepo.getClients()
    }

    getRecentClients = async (limit: number) => {
        return await this.clientRepo.getClients(limit)
    }

    getClientById = async (id: number) => {
        return await this.clientRepo.getClientById(id)
    }

    updateClient = async (
        id: number,
        name?: string,
        email?: string,
        client_type?: string,
        phone?: string,
        address?: string,
        status?: string
    ) => {

        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            await this.userRepo.updateUserWithConnection(connection, id, name, email)

            if (status) {
                await this.userRepo.updateUserStatusWithConnection(connection, id, status)
            }

            await this.clientRepo.updateClientWithConnection(connection, id, client_type, phone, address)

            await connection.commit()

        } catch (err) {
            await connection.rollback()
            throw err
        } finally {
            connection.release()
        }
    }

    deleteClient = async (id: number) => {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()
            await this.clientRepo.deleteClientWithConnection(connection, id)
            await this.userRepo.deleteUserWithConnection(connection, id)
            await connection.commit()
        } catch (err) {
            await connection.rollback()
            throw err
        } finally {
            connection.release()
        }
    }
}
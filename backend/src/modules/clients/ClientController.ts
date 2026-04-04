import { Request, Response } from "express";
import { ClientService } from "./ClientService.js";
import { logger } from "../../shared/utils/logger.js";

export class ClientController {
    constructor(private clientService: ClientService) { }

    createClient = async (req: Request, res: Response) => {
        const requestId = String(req.header("x-client-request-id") || `client-create-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`);
        try {
            const { name, email, client_type, phone, address } = req.body
            const secretaryId = req.user?.id;
            if (!secretaryId) {
                return res.status(401).json({ message: "Unauthorized: missing authenticated secretary id" });
            }
            logger.info({
                context: "clients.create.controller.received",
                requestId,
                body: { name, email, client_type, phone, address },
                userId: secretaryId
            }, "Create client request received");

            const data = await this.clientService.createClient(
                name,
                email,
                client_type,
                phone,
                address,
                secretaryId,
                requestId
            )
            logger.info({
                context: "clients.create.controller.success",
                requestId,
                createdClientId: data?.id ?? null
            }, "Create client request succeeded");

            res.status(201).json({ data, message: 'Client created successfully' })
        } catch (err: any) {
            logger.error({
                context: "clients.create.controller.error",
                requestId,
                errorMessage: err?.message ?? String(err),
                errorStack: err?.stack
            }, "Create client request failed");
            res.status(400).json({ message: err?.message ?? "Unable to create client" })
        }
    }

    getClients = async (_req: Request, res: Response) => {
        const clients = await this.clientService.getClients()
        res.json(clients)
    }

    getRecentClients = async (req: Request, res: Response) => {
        let limit = parseInt(req.query.limit as string);

        // si limit est invalide ou absent, on définit une valeur par défaut
        if (isNaN(limit) || limit <= 0) {
            limit = 3; // par exemple
        }

        const clients = await this.clientService.getRecentClients(limit);
        res.json(clients);
    };

    getClientById = async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const client = await this.clientService.getClientById(id)

        if (!client) {
            return res.status(404).json({ message: 'Client not found' })
        }

        res.json(client)
    }

    updateClient = async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        const { name, email, client_type, phone, address } = req.body

        await this.clientService.updateClient(id, name, email, client_type, phone, address)

        res.json({ message: 'Client updated' })
    }

    deleteClient = async (req: Request, res: Response) => {
        const id = Number(req.params.id)
        await this.clientService.deleteClient(id)

        res.json({ message: 'Client deactivated' })
    }
}
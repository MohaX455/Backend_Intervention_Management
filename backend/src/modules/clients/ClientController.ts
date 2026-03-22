import { Request, Response } from "express";
import { ClientService } from "./ClientService.js";

export class ClientController {
    constructor(private clientService: ClientService) { }

    createClient = async (req: Request, res: Response) => {
        try {
            const { name, email, clientType, phone, address } = req.body

            const data = await this.clientService.createClient(
                name,
                email,
                clientType,
                phone,
                address
            )

            res.status(201).json({ data, message: 'Client created successfully' })
        } catch (err) {
            res.status(400).json({ message: err })
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
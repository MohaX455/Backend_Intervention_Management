import { Request, Response } from "express";
import { ClientService } from "./ClientService.js";

export class ClientController {
    constructor(private clientService: ClientService) { }

    createClient = async (req: Request, res: Response) => {
        try {
            const { name, email, client_type, phone, address } = req.body

            const data = await this.clientService.createClient(
                name,
                email,
                client_type,
                phone,
                address
            )

            res.status(201).json({ data: data,message: 'Client created successfully' })
        } catch (err) {
            res.status(400).json({ message: err })
        }
    }

    getClients = async (_req: Request, res: Response) => {
        const clients = await this.clientService.getClients()
        res.json(clients)
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
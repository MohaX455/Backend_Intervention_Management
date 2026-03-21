import { Router, RequestHandler } from "express";
import { ClientController } from "./ClientController.js";

export const clientRoutes = (
    clientController: ClientController,
    authMiddleware: RequestHandler
): Router => {

    const router = Router();

    router.post("/clients", authMiddleware, clientController.createClient)
    router.get("/clients", authMiddleware, clientController.getClients)
    router.put("/clients/:id", authMiddleware, clientController.updateClient)
    router.delete("/clients/:id", authMiddleware, clientController.deleteClient)

    return router;
};
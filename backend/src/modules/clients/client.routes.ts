import { Router, RequestHandler } from "express";
import { ClientController } from "./ClientController.js";

export const clientRoutes = (
    clientController: ClientController,
    authMiddleware: RequestHandler
): Router => {

    const router = Router();

    router.post("/", authMiddleware, clientController.createClient)
    router.get("/", authMiddleware, clientController.getClients)
    router.get("/recent", authMiddleware, clientController.getRecentClients)
    router.get("/:id", authMiddleware, clientController.getClientById)
    router.put("/:id", authMiddleware, clientController.updateClient)
    router.delete("/:id", authMiddleware, clientController.deleteClient)

    return router;
};
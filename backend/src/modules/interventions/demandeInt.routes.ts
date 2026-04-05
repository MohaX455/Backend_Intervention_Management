import { Router, RequestHandler } from "express";
import { DemandeIntController } from "./DemandeIntController.js";

export const demandeIntRoutes = (controller: DemandeIntController, authMiddleware: RequestHandler) => {
    const router = Router();

    router.post("/", authMiddleware, controller.create);
    router.get("/", authMiddleware, controller.getAll);
    router.get("/recent", authMiddleware, controller.getRecent);
    router.get("/stats", authMiddleware, controller.getStats);
    router.get("/:id", authMiddleware, controller.getOne);
    router.put("/:id", authMiddleware, controller.update);
    router.delete("/:id", authMiddleware, controller.delete);

    return router;
}
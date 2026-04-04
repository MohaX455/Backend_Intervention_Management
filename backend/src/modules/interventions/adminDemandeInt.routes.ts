import { Router, RequestHandler } from "express";
import { DemandeIntController } from "./DemandeIntController.js";

export const adminDemandeIntRoutes = (controller: DemandeIntController, authMiddleware: RequestHandler) => {
    const router = Router();

    router.get("/stats", authMiddleware, controller.getStats);
    router.get("/technicians/available", authMiddleware, controller.getAvailableTechnicians);
    router.get("/assignments", authMiddleware, controller.getAllAssignments);

    return router;
};

import { Router, RequestHandler } from "express";
import { DemandeIntController } from "./DemandeIntController.js";

export const adminDemandeIntRoutes = (controller: DemandeIntController, authMiddleware: RequestHandler) => {
    const router = Router();

    router.get("/", authMiddleware, controller.getRequests);
    router.get("/technicians/available", authMiddleware, controller.getAvailableTechnicians);
    router.get("/assignments", authMiddleware, controller.getAllAssignments);
    router.get("/:id", authMiddleware, controller.getRequest);
    router.post("/:id/assign", authMiddleware, controller.assignRequest);
    router.patch("/:id/cancel", authMiddleware, controller.cancelRequest);
    router.patch("/:id/recover", authMiddleware, controller.recoverRequest);

    return router;
};

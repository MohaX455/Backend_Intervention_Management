import { Router, RequestHandler } from "express";
import { InterventionController } from "./IntController.js";

export const interventionRoutes = (controller: InterventionController, authMiddleware: RequestHandler) => {
    const router = Router();

    router.post("/", authMiddleware, controller.create);
    router.get("/", authMiddleware, controller.getAll);
    router.get("/recent", authMiddleware, controller.getRecent);
    router.get("/:id", authMiddleware, controller.getOne);
    router.put("/:id", authMiddleware, controller.update);
    router.delete("/:id", authMiddleware, controller.delete);
    router.patch("/:id/assign", authMiddleware, controller.assignTechnician);
    router.patch("/:id/start", authMiddleware, controller.startIntervention);
    router.patch("/:id/complete", authMiddleware, controller.completeIntervention);

    return router;
}
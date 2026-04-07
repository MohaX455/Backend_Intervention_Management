import { RequestHandler, Router } from 'express'
import { UserController } from "./UserController.js";

export const userRoutes = (userController: UserController, authMiddleware: RequestHandler): Router => {
    const router = Router();
    router.post("/", authMiddleware, userController.createUser)
    router.get("/", authMiddleware, userController.getUsers)
    router.put("/:id", authMiddleware, userController.updateUser)
    router.patch("/:id/status", authMiddleware, userController.updateUserStatus)
    router.patch("/:id/resend-invite", authMiddleware, userController.resendInvitation)
    router.delete("/:id", authMiddleware, userController.deleteUser)
    return router;
};

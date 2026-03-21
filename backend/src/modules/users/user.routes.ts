import { RequestHandler, Router } from 'express'
import { UserController } from "./UserController.js";

export const userRoutes = (userController: UserController, authMiddleware: RequestHandler): Router => {
    const router = Router();
    router.post("/users", authMiddleware, userController.createUser)
    router.get('/users', authMiddleware, userController.getUsers)
    router.put('/users/:id', authMiddleware, userController.updateUser)
    router.delete('/users/:id', authMiddleware, userController.deleteUser)
    return router;
};

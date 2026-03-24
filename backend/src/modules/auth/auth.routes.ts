import { Router, RequestHandler } from "express";
import { AuthController } from "./AuthController.js";

export const authRoutes = (
    authController: AuthController, 
    authMiddleware: RequestHandler
): Router => {
    const router = Router();

    router.post("/login", authController.login);
    router.post("/logout", authController.logout);
    router.get('/me', authMiddleware, authController.me);
    router.put('/me', authMiddleware, authController.updateProfile);
    router.post('/set-password', authController.setPassword)

    return router;
};

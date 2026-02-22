import { Router } from "express";
import { AuthController } from "./AuthController.js";
import { AuthService } from "./AuthService.js";
import { AuthRepository } from "./AuthRepository.js";
import { BcryptService } from "./BcryptService.js";
import { JWTService } from "./JWTService.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";

const router = Router();

// Injection manuelle
const authRepo = new AuthRepository();
const bcryptService = new BcryptService();
const jwtService = new JWTService();
const authService = new AuthService(authRepo, bcryptService, jwtService);
const authController = new AuthController(authService);

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get('/me', authMiddleware, authController.me)

export default router;

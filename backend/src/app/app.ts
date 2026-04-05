import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { env } from "../config/env/env.config.js";

import { notFoundMiddleware } from "../shared/middleware/notFound.middleware.js";
import { errorMiddleware } from "../shared/middleware/error.middleware.js";

import { BcryptService } from "../shared/utils/BcryptService.js";
import { JWTService } from "../modules/auth/JWTService.js";
import { AuthRepository } from "../modules/auth/AuthRepository.js";
import { AuthService } from "../modules/auth/AuthService.js";
import { AuthController } from "../modules/auth/AuthController.js";
import { authMiddleware } from "../shared/middleware/auth.middleware.js";

import { UserRepository } from "../modules/users/UserRepository.js";
import { UserService } from "../modules/users/UserService.js";
import { UserController } from "../modules/users/UserController.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { userRoutes } from "../modules/users/user.routes.js";
import { EmailService } from "../shared/utils/email.js";

import { ClientRepository } from "../modules/clients/ClientRepository.js";
import { ClientService } from "../modules/clients/ClientService.js";
import { ClientController } from "../modules/clients/ClientController.js";
import { clientRoutes } from "../modules/clients/client.routes.js";

import { DemandeIntRepository } from "../modules/interventions/DemandeIntRepository.js";
import { DemandeIntService } from "../modules/interventions/DemandeIntService.js";
import { DemandeIntController } from "../modules/interventions/DemandeIntController.js";
import { demandeIntRoutes } from "../modules/interventions/demandeInt.routes.js";
import { adminDemandeIntRoutes } from "../modules/interventions/adminDemandeInt.routes.js";

export const createApp = () => {
    const app = express();

    app.use(helmet());
    app.use(express.json())
    app.use(cookieParser())
    app.use(cors({
        origin: [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "http://127.0.0.1:5501",
            "http://localhost:5501"
        ],
        credentials: true
    }));

    app.get("/health", (_, res) => {
        res.status(200).json({ status: "OK" });
    });

    // Protected route example
    app.get('/api/protected',
        authMiddleware,
        (_req, res) => res.json('Welcome to the protected route')
    )

    // --- Services partagés ---
    const bcryptService = new BcryptService();
    const jwtService = new JWTService(env.jwt);
    const emailService = new EmailService();

    // --- Module AUTH ---
    const authRepo = new AuthRepository();
    const authService = new AuthService(authRepo, bcryptService, jwtService);
    const authController = new AuthController(authService);

    // --- Module USER ---
    const userRepo = new UserRepository();
    const userService = new UserService(userRepo, emailService);
    const userController = new UserController(userService);

    // --- Module CLIENT ---
    const clientRepo = new ClientRepository();
    const clientService = new ClientService(clientRepo, userRepo);
    const clientController = new ClientController(clientService);

    // --- Module DEMANDE ---
    const demandeIntRepo = new DemandeIntRepository();
    const demandeIntService = new DemandeIntService(demandeIntRepo);
    const demandeIntController = new DemandeIntController(demandeIntService);


    // --- Montage des routes avec injection ---
    app.use("/api/auth", authRoutes(authController, authMiddleware));
    app.use("/api/secretary", clientRoutes(clientController, authMiddleware));
    app.use("/api/admin", userRoutes(userController, authMiddleware));
    app.use("/api/admin/clients", clientRoutes(clientController, authMiddleware));
    app.use("/api/admin/interventions", adminDemandeIntRoutes(demandeIntController, authMiddleware));
    app.use("/api/interventions", demandeIntRoutes(demandeIntController, authMiddleware));

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
};

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from 'cookie-parser'

import { notFoundMiddleware } from "../shared/middleware/notFound.middleware.js";
import { errorMiddleware } from "../shared/middleware/error.middleware.js";
import { asyncHandler } from "../shared/middleware/asyncHandler.js";
import authRoutes from "../modules/auth/auth.routes.js"

export const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(helmet());
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

    // Routes
    app.use('/auth', authRoutes)

    app.use(notFoundMiddleware);
    app.use(asyncHandler(errorMiddleware));
    app.use(errorMiddleware);

    return app;
};

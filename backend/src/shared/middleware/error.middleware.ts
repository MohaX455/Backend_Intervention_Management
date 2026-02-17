import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    logger.error({ err, path: req.path, method: req.method });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
};


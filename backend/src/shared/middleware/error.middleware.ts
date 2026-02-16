import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = (error as any)?.statusCode || 500;
  const message = (error as any)?.message || "Internal Server Error";

  logger.error(error);

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: (error as any)?.stack })
  });
};

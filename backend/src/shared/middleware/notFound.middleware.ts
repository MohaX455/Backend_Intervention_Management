import { Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const notFoundMiddleware = (req: Request, res: Response): void => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`
  });
};

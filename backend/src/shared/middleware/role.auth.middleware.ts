import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const verifyRole = (allowRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role_id = req.user?.role;

    if (!role_id) {
      throw new AppError('Unauthorized', 401);
    }

    if (!allowRoles.includes(role_id)) {
      throw new AppError('Forbidden', 403);
    }
    next();
  };
};
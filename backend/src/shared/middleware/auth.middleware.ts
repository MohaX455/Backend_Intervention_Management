import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { AUTH_COOKIE_NAME } from "../../modules/auth/auth.constants.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[AUTH_COOKIE_NAME];

    if (!token) {
        throw new AppError('Unauthorized', 401)
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, name: string, role: number }
        req.user = decoded
        next();
    } catch (err) {
        throw new AppError('Invalid token', 403)
    }
}
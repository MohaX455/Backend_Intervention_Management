import { Request, Response } from "express";
import { AuthService } from "./AuthService.js";
import { AppError } from "../../shared/errors/AppError.js";
import {
    AUTH_COOKIE_NAME,
    ROLE_COOKIE_NAME,
    DEFAULT_COOKIE_OPTIONS,
    ROLE_COOKIE_OPTIONS,
} from "./auth.constants.js";

export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Handle user login
     */
    login = async (req: Request, res: Response) => {
        const { name, password } = req.body;

        if (!name || !password) {
            throw new AppError("Name and password required", 400);
        }

        const { token, user_role } = await this.authService.login(name, password);

        res.cookie(AUTH_COOKIE_NAME, token, DEFAULT_COOKIE_OPTIONS);
        res.cookie(ROLE_COOKIE_NAME, user_role, ROLE_COOKIE_OPTIONS);

        return res.status(200).json({
            status: "success",
            message: "Login successful"
        });
    };

    /**
     * Get current authenticated user info
     */
    me = (req: Request, res: Response) => {
        const { user } = req;

        if (!user) {
            throw new AppError("Unauthorized", 401);
        }

        return res.status(200).json({
            status: "success",
            data: { user }
        });
    }

    /**
     * Handle user logout by clearing cookies
     */
    logout = (_req: Request, res: Response) => {
        res.clearCookie(AUTH_COOKIE_NAME, DEFAULT_COOKIE_OPTIONS);
        res.clearCookie(ROLE_COOKIE_NAME, ROLE_COOKIE_OPTIONS);

        return res.status(200).json({
            status: "success",
            message: "Logout successful"
        });
    }
}

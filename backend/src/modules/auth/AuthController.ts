import { Request, Response } from "express";
import { AuthService } from "./AuthService.js";
import { logger } from "../../shared/utils/logger.js";

export class AuthController {
    constructor(private authService: AuthService) { }

    // Login
    login = async (req: Request, res: Response) => {
        try {
            const { name, password } = req.body;
            const token = await this.authService.login(name, password);

            // Stockage dans cookie sécurisé
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 // 1 jour
            });

            res.json({ message: "Login successful" });
        } catch (error: any) {
            logger.error(error);
            res.status(401).json({ message: error.message });
        }
    };

    // Logout
    logout = (req: Request, res: Response) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.json({ message: "Logged out successfully" });
    }
}

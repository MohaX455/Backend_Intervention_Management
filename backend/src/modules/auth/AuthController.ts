import { NextFunction, Request, Response } from "express";
import { AuthService } from "./AuthService.js";
import { logger } from "../../shared/utils/logger.js";

export class AuthController {
    constructor(private authService: AuthService) { }

    // Login
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const { GeneratedToken, roleId } = await this.authService.login(email, password);

            // Stockage dans cookie sécurisé
            res.cookie("token", GeneratedToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 // 1 jour
            });

            // Stokage cookie pour redirection côté client
            res.cookie("user_role", roleId, {
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

    // Me
    me = (req: Request, res: Response) => {
        const user = req.user
        console.log(user)
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.json({ user });
    }

    // Logout
    logout = (req: Request, res: Response) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.clearCookie("user_role", {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.json({ message: "Logged out successfully" });
    }

    setPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, password } = req.body
            await this.authService.setPassword(token, password)
            res.status(200).json({ message: 'Password set successfully' })
        } catch (err) {
            logger.error(err);
            res.status(401).json({ message: err || 'Failed to set password' });
        }
    }
}

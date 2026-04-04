import { NextFunction, Request, Response } from "express";
import { AuthService } from "./AuthService.js";
import { logger } from "../../shared/utils/logger.js";

export class AuthController {
    constructor(private authService: AuthService) { }

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const { token, roleId } = await this.authService.login(email, password);

            const cookieConfig = {
                httpOnly: true,
                sameSite: "lax" as const,
                maxAge: 86400000 // 24 hours in ms
            };

            res.cookie("token", token, { ...cookieConfig, secure: false });
            res.cookie("user_role", roleId, { ...cookieConfig, httpOnly: false, secure: false });

            res.status(200).json({
                message: "Login successful",
                roleId
            });
        } catch (error: any) {
            logger.error("Login error:", error.message);
            const statusCode = error.message.includes("not active") ? 403 : 401;
            res.status(statusCode).json({ message: error.message || "Authentication failed" });
        }
    };

    // Me
    me = (req: Request, res: Response) => {
        const user = req.user

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.json({ user });
    }

    // Logout
    logout = (req: Request, res: Response) => {
        const cookieConfig = {
            httpOnly: true,
            sameSite: "lax" as const,
            secure: false
        };

        res.clearCookie("token", cookieConfig);
        res.clearCookie("user_role", { ...cookieConfig, httpOnly: false });

        res.status(200).json({ message: "Logged out successfully" });
    }

    setPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({ message: "Token and password are required" });
            }

            await this.authService.setPassword(token, password);
            res.status(200).json({ message: "Password set successfully" });
        } catch (error: any) {
            logger.error("Set password error:", error.message);
            res.status(400).json({ message: error.message || "Failed to set password" });
        }
    }

    // Update profile
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { email, password } = req.body;
            await this.authService.updateProfile(user.id, email, password);
            res.json({ message: "Profile updated successfully" });
        } catch (error: any) {
            logger.error(error);
            res.status(400).json({ message: error.message });
        }
    }
}

import { Request, Response, NextFunction } from "express";
import { UserService } from "./UserService.js";
import { logger } from "../../shared/utils/logger.js";
import { AppError } from "../../shared/errors/AppError.js";

export class UserController {
    constructor(
        private userService: UserService
    ) { }

    // Create a new user and send invitation email
    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, role_id } = req.body
            const user = await this.userService.createUser(name, email, role_id)
            res.status(201).json({ message: 'User created and invitation email sent', data: user })
        } catch (err: any) {
            logger.error(err)
            const status = err instanceof AppError ? err.status : 500
            const message = err instanceof AppError ? err.message : 'Failed to create user'
            res.status(status).json({ message })
        }
    }

    // Get users (technician, secretary)
    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getUsers()
            res.status(200).json(users)
        } catch (err: any) {
            logger.error(err)
            const status = err instanceof AppError ? err.status : 500
            const message = err instanceof AppError ? err.message : 'Failed to show users'
            res.status(status).json({ message })
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, role_id } = req.body
            const id = Number(req.params.id)
            await this.userService.updateUser(id, name, email, role_id)
            res.status(200).json({ message: 'User updated successfully' })
        } catch (err: any) {
            logger.error(err)
            const status = err instanceof AppError ? err.status : 500
            const message = err instanceof AppError ? err.message : 'Failed to update user'
            res.status(status).json({ message })
        }
    }

    updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status } = req.body
            const id = Number(req.params.id)
            await this.userService.updateUserStatus(id, status)
            res.status(200).json({ message: 'User status updated successfully' })
        } catch (err: any) {
            logger.error(err)
            const status = err instanceof AppError ? err.status : 500
            const message = err instanceof AppError ? err.message : 'Failed to update user status'
            res.status(status).json({ message })
        }
    }

    resendInvitation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            const user = await this.userService.resendInvitation(id)
            res.status(200).json({ message: 'Invitation resent successfully', data: user })
        } catch (err: any) {
            logger.error(err)
            const status = err instanceof AppError ? err.status : 500
            const message = err instanceof AppError ? err.message : 'Failed to resend invitation'
            res.status(status).json({ message })
        }
    }

    // Delete user
    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            await this.userService.deleteUser(id)
            res.status(200).json({ message: 'User deleted successfully' })
        } catch (err: any) {
            logger.error(err)
            const status = err instanceof AppError ? err.status : 500
            const message = err instanceof AppError ? err.message : 'Failed to delete user'
            res.status(status).json({ message })
        }
    }
}
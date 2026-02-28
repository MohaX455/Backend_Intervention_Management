import { Request, Response, NextFunction } from "express";
import { UserService } from "./UserService.js";
import { logger } from "../../shared/utils/logger.js";


// TODO: Implement UserController
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    // Create a new user and send invitation email
    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, role_id } = req.body
            await this.userService.createUser(name, email, role_id)
            res.status(201).json({ message: 'User created and invitation email sent' })
        } catch (err) {
            logger.error(err);
            res.status(401).json({ message: err || 'Failed to create user' });
        }
    }

    // Get users (technician, secretary)
    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getUsers()
            res.status(200).json(users)
        } catch (err) {
            logger.error(err);
            res.status(401).json({ message: err || 'Failed to show users' });
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, role_id } = req.body
            const id = Number(req.params.id)
            await this.userService.updateUser(id, name, email, role_id)
            res.status(200).json({ message: 'User updated successfully' })
        } catch (err) {
            logger.error(err);
            res.status(401).json({ message: err || 'Failed to update user' });
        }
    }

    // Delete user
    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            await this.userService.deleteUser(id)
            res.status(200).json({ message: 'User deleted successfully' })
        } catch (err) {
            logger.error(err);
            res.status(401).json({ message: err || 'Failed to delete user' });
        }
    }
}
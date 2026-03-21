import { UserRepository } from "./UserRepository.js";
import { generateToken } from "../../shared/utils/tokenGenerator.js";
import { EmailService } from "../../shared/utils/email.js";
import { getIO } from "../../socket/socket.js";
import { UserRow } from "../../types/user.types.js";
import { BcryptService } from "../../shared/utils/BcryptService.js";

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService,
    ) { }

    // Create User
    createUser = async (name: string, email: string, roleId: number): Promise<void> => {

        if (!name || !email || !roleId) {
            throw new Error('Name, email and roleId are required')
        }

        const lowerEmail = email.toLowerCase()

        const existingUser = await this.userRepository.findByEmail(lowerEmail)
        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        const token = generateToken()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

        const userId = await this.userRepository.createUser(name, lowerEmail, roleId, token, expiresAt);

        // Send invitation email
        const link = `${process.env.FRONTEND_URL}/set-password.html?token=${token}`;
        const emailSubject = 'You are invited to join our app'
        const emailBody = `
            <p>Hello,</p>
            <p>You have been invited to join our app. Please click the link below to accept the invitation and set your password:</p>
            <a href="${link}">Accept Invitation</a>
            <p>This link will expire in 24 hours.</p>
        `

        const io = getIO();
        io.emit("newUser", {
            id: userId,
            name: name,
            email: lowerEmail,
            role_id: roleId,
            isActive: existingUser
        });

        await this.emailService.sendEmail(lowerEmail, emailSubject, emailBody)
    }

    // Get users
    getUsers = async (): Promise<UserRow[]> => {
        return await this.userRepository.getUsers()
    }

    // Update user
    updateUser = async (id: number, name: string, email: string, roleId: number): Promise<void> => {

        // Validation stricte
        if (id == null || !name?.trim() || !email?.trim() || roleId == null) {
            throw new Error('Invalid input data')
        }

        const lowerEmail = email.toLowerCase()

        // Vérifier que l'utilisateur existe
        const existingUser = await this.userRepository.findById(id)
        if (!existingUser) {
            throw new Error('User not found')
        }

        // Tenter l'update
        try {
            await this.userRepository.updateUser(id, name.trim(), lowerEmail.trim(), roleId)
        } catch (error: any) {

            // Gestion propre de l'unicité email
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                throw new Error('Email already exists')
            }

            throw error
        }
    }

    // Delete user
    deleteUser = async (id: number): Promise<void> => {
        const existingUser = await this.userRepository.findById(id)
        if (!existingUser) {
            throw new Error('User not found !')
        }
        await this.userRepository.deleteUser(id)
    }
}

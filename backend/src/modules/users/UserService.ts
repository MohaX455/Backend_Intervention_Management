import { UserRepository } from "./UserRepository.js";
import { generateToken } from "../../shared/utils/tokenGenerator.js";
import { EmailService } from "../../shared/utils/email.js";
import { AppError } from "../../shared/errors/AppError.js";
import { UserResponseDto } from "../../types/user.types.js";

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService,
    ) { }

    private createInvitationLink(token: string) {
        return `${process.env.FRONTEND_URL}/set-password.html?token=${token}`;
    }

    private mapUserToResponse(user: { id: number; name: string; email: string; role_id: number; status: string; created_at?: Date | string }): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            status: user.status,
            created_at: user.created_at ? new Date(user.created_at).toISOString() : undefined,
        };
    }

    createUser = async (name: string, email: string, roleId: number): Promise<UserResponseDto> => {
        if (!name || !email || !roleId) {
            throw new AppError('Name, email and roleId are required.', 400);
        }

        if (typeof roleId !== 'number' || ![2, 3].includes(roleId)) {
            throw new AppError('Role must be Technician or Secretary.', 400);
        }

        const lowerEmail = email.toLowerCase().trim();
        if (!lowerEmail) {
            throw new AppError('Email is required.', 400);
        }

        const existingUser = await this.userRepository.findByEmail(lowerEmail);
        if (existingUser) {
            throw new AppError('A user with this email already exists.', 409);
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const userId = await this.userRepository.createUser(name.trim(), lowerEmail, roleId, token, expiresAt, 'Invited');

        const link = this.createInvitationLink(token);
        const emailSubject = 'You are invited to join our app';
        const emailBody = `
            <p>Hello,</p>
            <p>You have been invited to join our app. Please click the link below to accept the invitation and set your password:</p>
            <a href="${link}">Accept Invitation</a>
            <p>This link will expire in 24 hours.</p>
        `;

        await this.emailService.sendEmail(lowerEmail, emailSubject, emailBody);

        return this.mapUserToResponse({
            id: userId,
            name: name.trim(),
            email: lowerEmail,
            role_id: roleId,
            status: 'invited',
            created_at: new Date(),
        });
    }

    resendInvitation = async (id: number): Promise<UserResponseDto> => {
        if (!id || Number.isNaN(id)) {
            throw new AppError('Invalid user id for invitation resend.', 400);
        }

        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new AppError('User not found.', 404);
        }

        const normalizedStatus = String(user.status || '').trim().toLowerCase();
        if (normalizedStatus !== 'Invited') {
            throw new AppError('Only invited users can receive a new invitation.', 400);
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.userRepository.updateInvitationToken(id, token, expiresAt);

        const link = this.createInvitationLink(token);
        const emailSubject = 'Your invitation has been resent';
        const emailBody = `
            <p>Hello,</p>
            <p>Your invitation has been resent. Please click the link below to set your password:</p>
            <a href="${link}">Accept Invitation</a>
            <p>This link will expire in 24 hours.</p>
        `;

        await this.emailService.sendEmail(user.email, emailSubject, emailBody);

        return this.mapUserToResponse(user);
    }

    getUsers = async (): Promise<UserResponseDto[]> => {
        const users = await this.userRepository.getUsers();
        return users.map((user) => this.mapUserToResponse(user));
    }

    updateUser = async (id: number, name: string, email: string, roleId: number): Promise<void> => {
        if (!id || !name?.trim() || !email?.trim() || !roleId) {
            throw new AppError('Invalid input data.', 400);
        }

        if (!Number.isInteger(id) || ![2, 3].includes(roleId)) {
            throw new AppError('Invalid role or user ID.', 400);
        }

        const lowerEmail = email.toLowerCase().trim();
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new AppError('User not found.', 404);
        }

        try {
            await this.userRepository.updateUser(id, name.trim(), lowerEmail, roleId);
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                throw new AppError('Email already exists.', 409);
            }
            throw new AppError('Unable to update user.', 500);
        }
    }

    updateUserStatus = async (id: number, status: string): Promise<void> => {
        if (!id || !status?.trim()) {
            throw new AppError('Invalid input data.', 400);
        }

        const normalized = String(status).trim().toLowerCase();
        if (!['active', 'inactive'].includes(normalized)) {
            throw new AppError('Status must be Active or Inactive.', 400);
        }

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new AppError('User not found.', 404);
        }

        await this.userRepository.updateUserStatus(id, normalized);
    }

    deleteUser = async (id: number): Promise<void> => {
        if (!id || Number.isNaN(id)) {
            throw new AppError('Invalid user id.', 400);
        }

        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new AppError('User not found.', 404);
        }

        await this.userRepository.deleteUser(id);
    }
}

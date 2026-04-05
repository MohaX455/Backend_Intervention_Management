import { RowDataPacket } from "mysql2";

export type UserRow = RowDataPacket & {
    id: number;
    name: string;
    email: string;
    password: string;
    role_id: number;
    status: string;
    invitation_token?: string | null;
    invitation_expires_at?: Date | null;
    reset_password_token?: string | null;
    reset_password_expires_at?: Date | null;
};

export type UserResponseDto = {
    id: number;
    name: string;
    email: string;
    role_id: number;
    status: string;
    created_at?: string;
};

export type CreateUserDto = {
    name: string;
    email: string;
    role_id: number;
};
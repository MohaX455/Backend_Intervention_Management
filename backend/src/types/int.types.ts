import { RowDataPacket } from 'mysql2';

export type InterventionRow = RowDataPacket & {
    id: number;
    client_id: number;
    created_by: number;
    title: string;
    description: string;
    status: 'created' | 'validated' | 'cancelled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    intervention_address: string;
    latitude: number | null;
    longitude: number | null;
    created_at: Date;
    updated_at: Date;
};

export type TechnicianRow = RowDataPacket & {
    id: number;
    username: string;
    email: string;
    phone: string;
    availability: boolean;
};
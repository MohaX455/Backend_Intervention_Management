import { RowDataPacket } from 'mysql2';

export type InterventionRow = RowDataPacket & {
    id: number;
    client_id: number;
    created_by: number;
    assigned_to: number | null;
    title: string;
    description: string;
    status: 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    intervention_address: string;
    latitude: number | null;
    longitude: number | null;
    scheduled_start: Date | null;
    scheduled_end: Date | null;
    started_at: Date | null;
    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
};
// modules/interventions/InterventionRepository.ts
import { pool } from '../../config/database/mysql.config.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { InterventionRow } from '../../types/int.types.js';

export type AssignmentRow = RowDataPacket & {
    id: number;
    demande_id: number;
    statut: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    title: string;
    intervention_address: string;
    client_name?: string;
    client_email?: string;
    technician_name?: string;
    technician_email?: string;
    date_start?: Date | null;
    date_end?: Date | null;
    created_at: Date;
    updated_at: Date;
};

export class DemandeIntRepository {
    create = async (
        clientId: number,
        createdBy: number,
        title: string,
        description: string,
        priority: 'low' | 'normal' | 'high' | 'urgent',
        interventionAddress: string,
        latitude: number | null,
        longitude: number | null
    ): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO demandeInterventions
            (client_id, created_by, title, description, priority, intervention_address, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [clientId, createdBy, title, description, priority, interventionAddress, latitude, longitude]
        );
        return result.insertId;
    }

    findById = async (id: number): Promise<(InterventionRow & { client_name?: string; client_email?: string }) | null> => {
        const [rows] = await pool.execute<(InterventionRow & { client_name?: string; client_email?: string })[]>(
            `SELECT i.*, u.username AS client_name, u.email AS client_email
            FROM demandeInterventions i
            LEFT JOIN users u ON i.client_id = u.id
            WHERE i.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    getAll = async (limit?: number): Promise<Array<InterventionRow & { client_name?: string; client_email?: string }>> => {
        let query = `SELECT i.*, u.username AS client_name, u.email AS client_email
            FROM demandeInterventions i
            LEFT JOIN users u ON i.client_id = u.id
            ORDER BY i.created_at DESC`;

        if (limit && !isNaN(limit) && limit > 0) {
            query += ` LIMIT ${Number(limit)}`;
        }

        const [rows] = await pool.execute<Array<InterventionRow & { client_name?: string; client_email?: string }>>(query);
        return rows;
    }

    getAllAssignments = async (): Promise<AssignmentRow[]> => {
        const [rows] = await pool.execute<AssignmentRow[]>(
            `SELECT i.id,
                    i.demande_id,
                    i.statut,
                    i.date_start,
                    i.date_end,
                    i.created_at,
                    i.updated_at,
                    d.title,
                    d.intervention_address,
                    u.username AS client_name,
                    u.email AS client_email,
                    t.username AS technician_name,
                    t.email AS technician_email
            FROM interventions i
            LEFT JOIN demandeInterventions d ON i.demande_id = d.id
            LEFT JOIN users u ON d.client_id = u.id
            LEFT JOIN users t ON i.technicien_id = t.id
            ORDER BY i.created_at DESC`
        );
        return rows;
    }

    updateStatus = async (id: number, status: string): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE demandeInterventions SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    }

    assignTechnician = async (interventionId: number, userId: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE demandeInterventions SET assigned_to = ?, status = "assigned" WHERE id = ?',
            [userId, interventionId]
        );
        return result.affectedRows;
    }

    setStarted = async (id: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE demandeInterventions SET status = "in_progress" WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    setCompleted = async (id: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE demandeInterventions SET status = "completed" WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    update = async (
        id: number,
        clientId: number,
        title: string,
        description: string,
        priority: 'low' | 'normal' | 'high' | 'urgent',
        interventionAddress: string,
        latitude: number | null,
        longitude: number | null
    ): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE demandeInterventions SET client_id = ?, title = ?, description = ?, priority = ?, intervention_address = ?, latitude = ?, longitude = ? WHERE id = ?',
            [clientId, title, description, priority, interventionAddress, latitude, longitude, id]
        );
        return result.affectedRows;
    }

    delete = async (id: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM demandeInterventions WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    getTotalInterventions = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM demandeInterventions'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getAvailableTechniciansCount = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM technician_profiles WHERE availability = 1'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getNewInterventionsCount = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM demandeInterventions WHERE status = "created"'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getPendingInterventionsCount = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM demandeInterventions WHERE status = "validated"'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getRecentWeekInterventionsCount = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM demandeInterventions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getAvailableTechnicians = async (): Promise<Array<{ id: number; name: string; specialization: string }>> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT tp.technician_id as id, u.username as name, tp.speciality as specialization
            FROM technician_profiles tp
            JOIN users u ON tp.technician_id = u.id
            WHERE tp.availability = 1`
        );
        return rows as Array<{ id: number; name: string; specialization: string }>;
    }
}
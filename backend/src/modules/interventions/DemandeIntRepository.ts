// modules/interventions/InterventionRepository.ts
import { pool } from '../../config/database/mysql.config.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { InterventionRow } from '../../types/int.types.js';

export type AdminRequestRow = InterventionRow & {
    client_name?: string;
    client_email?: string;
};

export type TechnicianAvailabilityRow = RowDataPacket & {
    id: number;
    name: string;
    email: string;
    specialization: string;
};

export type AssignmentRow = RowDataPacket & {
    id: number;
    demande_id: number;
    statut: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    request_status?: 'created' | 'validated' | 'cancelled';
    title: string;
    description: string;
    intervention_address: string;
    latitude?: number | null;
    longitude?: number | null;
    estimated_duration?: number | null;
    client_name?: string;
    client_email?: string;
    technician_name?: string;
    technician_email?: string;
    support_technicians?: string | null;
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

    findById = async (id: number): Promise<AdminRequestRow | null> => {
        const [rows] = await pool.execute<AdminRequestRow[]>(
            `SELECT i.*, u.username AS client_name, u.email AS client_email
            FROM demandeInterventions i
            LEFT JOIN users u ON i.client_id = u.id
            WHERE i.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    getAll = async (limit?: number): Promise<AdminRequestRow[]> => {
        let query = `SELECT i.*, u.username AS client_name, u.email AS client_email
            FROM demandeInterventions i
            LEFT JOIN users u ON i.client_id = u.id
            ORDER BY i.created_at DESC`;

        if (limit && !isNaN(limit) && limit > 0) {
            query += ` LIMIT ${Number(limit)}`;
        }

        const [rows] = await pool.execute<AdminRequestRow[]>(query);
        return rows;
    }

    getAllAssignments = async (limit?: number): Promise<AssignmentRow[]> => {
        let query = `SELECT i.id,
                    i.demande_id,
                    i.statut,
                    d.status AS request_status,
                    i.planned_start as date_start,
                    i.estimated_duration,
                    i.actual_end as date_end,
                    i.created_at,
                    i.updated_at,
                    d.title,
                    d.description,
                    d.intervention_address,
                    d.latitude,
                    d.longitude,
                    u.username AS client_name,
                    u.email AS client_email,
                    t.username AS technician_name,
                    t.email AS technician_email,
                    s.support_technicians
            FROM interventions i
            LEFT JOIN demandeInterventions d ON i.demande_id = d.id
            LEFT JOIN users u ON d.client_id = u.id
            LEFT JOIN intervention_technicians it ON i.id = it.intervention_id AND it.role = 'lead'
            LEFT JOIN users t ON it.technician_id = t.id
            LEFT JOIN (
                SELECT it.intervention_id,
                    GROUP_CONCAT(u.username SEPARATOR ', ') AS support_technicians
                FROM intervention_technicians it
                JOIN users u ON it.technician_id = u.id
                WHERE it.role = 'support'
                GROUP BY it.intervention_id
            ) s ON s.intervention_id = i.id
            ORDER BY i.created_at DESC`;

        if (limit && !isNaN(limit) && limit > 0) {
            query += ` LIMIT ${Number(limit)}`;
        }

        const [rows] = await pool.execute<AssignmentRow[]>(query);
        return rows;
    }

    updateStatus = async (id: number, status: string): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE demandeInterventions SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    }

    createPlannedInterventionWithTechnicians = async (
        demandeId: number,
        leadId: number,
        dateStart: string,
        estimatedDuration: number,
        assignments: Array<{ technicianId: number; role: 'lead' | 'support' }>
    ): Promise<number> => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [interventionResult] = await connection.execute<ResultSetHeader>(
                `INSERT INTO interventions (demande_id, planned_start, estimated_duration, statut)
                VALUES (?, ?, ?, 'planned')`,
                [demandeId, dateStart, estimatedDuration]
            );

            const interventionId = interventionResult.insertId;
            const assignmentRows = assignments.map((assignment) => [
                interventionId,
                assignment.technicianId,
                assignment.role
            ]);

            if (assignmentRows.length > 0) {
                await connection.query(
                    'INSERT INTO intervention_technicians (intervention_id, technician_id, role) VALUES ?',
                    [assignmentRows]
                );
            }

            await connection.execute<ResultSetHeader>(
                'UPDATE demandeInterventions SET status = "validated" WHERE id = ?',
                [demandeId]
            );

            await connection.commit();
            return interventionId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    findActiveInterventionByDemandeId = async (demandeId: number): Promise<RowDataPacket | null> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT * FROM interventions
             WHERE demande_id = ?
               AND statut IN ('planned', 'in_progress')
             ORDER BY created_at DESC
             LIMIT 1`,
            [demandeId]
        );
        return rows[0] || null;
    }

    cancelInterventionById = async (id: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE interventions SET statut = "cancelled" WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    getAvailableTechniciansForWindow = async (startTime: string, bufferEndTime: string): Promise<TechnicianAvailabilityRow[]> => {
        const [rows] = await pool.execute<TechnicianAvailabilityRow[]>(
            `SELECT tp.technician_id as id, u.username as name, u.email as email, tp.speciality as specialization
            FROM technician_profiles tp
            JOIN users u ON tp.technician_id = u.id
            WHERE tp.availability = 1
              AND tp.technician_id NOT IN (
                SELECT it.technician_id
                FROM intervention_technicians it
                JOIN interventions i ON it.intervention_id = i.id
                WHERE i.statut IN ('planned', 'in_progress')
                  AND NOT (DATE_ADD(i.planned_start, INTERVAL i.estimated_duration HOUR) < ? OR i.planned_start > ?)
              )`,
            [startTime, bufferEndTime]
        );

        return rows as TechnicianAvailabilityRow[];
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
            'SELECT COUNT(*) as count FROM interventions'
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
            'SELECT COUNT(*) as count FROM interventions WHERE statut = "planned"'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getPendingInterventionsCount = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM interventions WHERE statut = "in_progress"'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getCancelledInterventionsCount = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM interventions WHERE statut = "cancelled"'
        );
        return (rows[0] as { count: number }).count || 0;
    }

    getCompletedInterventionsCount = async (): Promise<number> => {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM interventions WHERE statut = "completed"'
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
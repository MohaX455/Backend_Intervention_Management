// modules/interventions/InterventionRepository.ts
import { pool } from '../../config/database/mysql.config.js';
import { ResultSetHeader } from 'mysql2';
import { InterventionRow } from '../../types/int.types.js';

export class InterventionRepository {
    create = async (
        clientId: number,
        createdBy: number,
        title: string,
        description: string,
        priority: 'low' | 'normal' | 'high' | 'urgent',
        interventionAddress: string,
        latitude: number | null,
        longitude: number | null,
        scheduledStart: Date | null,
        scheduledEnd: Date | null
    ): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO interventions
            (client_id, created_by, title, description, priority, intervention_address, latitude, longitude, scheduled_start, scheduled_end)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [clientId, createdBy, title, description, priority, interventionAddress, latitude, longitude, scheduledStart, scheduledEnd]
        );
        return result.insertId;
    }

    findById = async (id: number): Promise<(InterventionRow & { client_name?: string }) | null> => {
        const [rows] = await pool.execute<(InterventionRow & { client_name?: string })[]>(
            `SELECT i.*, u.username AS client_name
            FROM interventions i
            LEFT JOIN users u ON i.client_id = u.id
            WHERE i.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    getAll = async (limit?: number): Promise<Array<InterventionRow & { client_name?: string}>> => {
        let query = `SELECT i.*, u.username AS client_name
            FROM interventions i
            LEFT JOIN users u ON i.client_id = u.id
            ORDER BY i.created_at DESC`;

        if (limit && !isNaN(limit) && limit > 0) {
            query += ` LIMIT ${Number(limit)}`;
        }

        const [rows] = await pool.execute<Array<InterventionRow & { client_name?: string }>>(query);
        return rows;
    }

    updateStatus = async (id: number, status: string): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE interventions SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    }

    assignTechnician = async (id: number, userId: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE interventions SET assigned_to = ?, status = "assigned" WHERE id = ?',
            [userId, id]
        );
        return result.affectedRows;
    }

    setStarted = async (id: number, startedAt: Date): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE interventions SET started_at = ?, status = "in_progress" WHERE id = ?',
            [startedAt, id]
        );
        return result.affectedRows;
    }

    setCompleted = async (id: number, completedAt: Date): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE interventions SET completed_at = ?, status = "completed" WHERE id = ?',
            [completedAt, id]
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
        longitude: number | null,
        scheduledStart: Date | null,
        scheduledEnd: Date | null
    ): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE interventions 
            SET client_id = ?, title = ?, description = ?, priority = ?, 
                intervention_address = ?, latitude = ?, longitude = ?, 
                scheduled_start = ?, scheduled_end = ?
            WHERE id = ?`,
            [clientId, title, description, priority, interventionAddress, latitude, longitude, scheduledStart, scheduledEnd, id]
        );
        return result.affectedRows;
    }

    delete = async (id: number): Promise<number> => {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM interventions WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
}
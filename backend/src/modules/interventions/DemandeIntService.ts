// modules/interventions/DemandeIntService.ts
import { DemandeIntRepository, AdminRequestRow } from "./DemandeIntRepository.js";
import { InterventionRow } from "../../types/int.types.js";

export class DemandeIntService {
    constructor(private interventionRepo: DemandeIntRepository) { }

    createIntervention = async (
        clientId: number,
        createdBy: number,
        title: string,
        description: string,
        priority: 'low' | 'normal' | 'high' | 'urgent',
        interventionAddress: string,
        latitude: number | null,
        longitude: number | null
    ) => {
        if (!clientId || !createdBy || !title || !description) {
            throw new Error("Missing required fields");
        }
        return await this.interventionRepo.create(clientId, createdBy, title, description, priority, interventionAddress, latitude, longitude);
    }

    getAllInterventions = async (): Promise<InterventionRow[]> => {
        return await this.interventionRepo.getAll();
    }

    getAdminRequests = async (): Promise<AdminRequestRow[]> => {
        return await this.interventionRepo.getAll();
    }

    getRecentInterventions = async (limit: number): Promise<InterventionRow[]> => {
        return await this.interventionRepo.getAll(limit);
    }

    getInterventionById = async (id: number): Promise<InterventionRow> => {
        const intervention = await this.interventionRepo.findById(id);
        if (!intervention) throw new Error("Intervention not found");
        return intervention;
    }

    getAdminRequestById = async (id: number): Promise<AdminRequestRow> => {
        const request = await this.interventionRepo.findById(id);
        if (!request) throw new Error("Request not found");
        return request;
    }

    getAllAssignments = async (limit?: number) => {
        return await this.interventionRepo.getAllAssignments(limit);
    }

    assignTechnician = async (interventionId: number, userId: number) => {
        return await this.interventionRepo.assignTechnician(interventionId, userId);
    }

    startIntervention = async (interventionId: number) => {
        return await this.interventionRepo.setStarted(interventionId);
    }

    completeIntervention = async (interventionId: number) => {
        return await this.interventionRepo.setCompleted(interventionId);
    }

    updateIntervention = async (
        id: number,
        clientId: number,
        title: string,
        description: string,
        priority: 'low' | 'normal' | 'high' | 'urgent',
        interventionAddress: string,
        latitude: number | null,
        longitude: number | null
    ) => {
        if (!clientId || !title || !description) {
            throw new Error("Missing required fields");
        }
        return await this.interventionRepo.update(id, clientId, title, description, priority, interventionAddress, latitude, longitude);
    }

    deleteIntervention = async (id: number) => {
        return await this.interventionRepo.delete(id);
    }

    getStats = async () => {
        const totalInterventions = await this.interventionRepo.getTotalInterventions();
        const availableTechnicians = await this.interventionRepo.getAvailableTechniciansCount();
        const newInterventions = await this.interventionRepo.getNewInterventionsCount();
        const pendingInterventions = await this.interventionRepo.getPendingInterventionsCount();
        const cancelledInterventions = await this.interventionRepo.getCancelledInterventionsCount();
        const completedInterventions = await this.interventionRepo.getCompletedInterventionsCount();
        const recentWeekInterventions = await this.interventionRepo.getRecentWeekInterventionsCount();

        return {
            totalInterventions,
            availableTechnicians,
            newInterventions,
            pendingInterventions,
            cancelledInterventions,
            completedInterventions,
            recentWeekInterventions
        };
    }

    getAvailableTechnicians = async (startTime?: string, estimatedDuration?: number) => {
        if (!startTime || !estimatedDuration) {
            return await this.interventionRepo.getAvailableTechnicians();
        }

        const start = new Date(startTime);
        if (Number.isNaN(start.getTime())) {
            throw new Error("Invalid start_time format");
        }

        if (estimatedDuration <= 0) {
            throw new Error("estimated_duration must be greater than 0");
        }

        const endDate = new Date(start.getTime() + estimatedDuration * 60 * 60 * 1000);
        const bufferEnd = new Date(endDate.getTime() + 60 * 60 * 1000);
        const startString = this.toSqlDatetime(start);
        const bufferEndString = this.toSqlDatetime(bufferEnd);

        return await this.interventionRepo.getAvailableTechniciansForWindow(startString, bufferEndString);
    }

    assignRequest = async (
        demandeId: number,
        startTime: string,
        estimatedDuration: number,
        leadId: number,
        supportIds: number[] = []
    ) => {
        const request = await this.interventionRepo.findById(demandeId);
        if (!request) {
            throw new Error("Request not found");
        }

        if (request.status !== 'created') {
            throw new Error("Only requests with status 'created' can be assigned");
        }

        if (!startTime || estimatedDuration <= 0) {
            throw new Error("Invalid start time or estimated duration");
        }

        if (!leadId) {
            throw new Error("A lead technician is required");
        }

        const normalizedSupports = Array.from(new Set(supportIds || []));
        if (normalizedSupports.length !== supportIds.length) {
            throw new Error("Duplicate support technician IDs are not allowed");
        }

        if (normalizedSupports.includes(leadId)) {
            throw new Error("Lead and support technicians must be different");
        }

        const start = new Date(startTime);
        if (Number.isNaN(start.getTime())) {
            throw new Error("Invalid start_time format");
        }

        const end = new Date(start.getTime() + estimatedDuration * 60 * 60 * 1000);
        const bufferEnd = new Date(end.getTime() + 30 * 60 * 1000);
        const startString = this.toSqlDatetime(start);
        const bufferEndString = this.toSqlDatetime(bufferEnd);

        const availableTechnicians = await this.interventionRepo.getAvailableTechniciansForWindow(startString, bufferEndString);
        const availableIds = availableTechnicians.map((tech) => tech.id);

        if (!availableIds.includes(leadId)) {
            throw new Error("Selected lead technician is not available for the requested time window");
        }

        const unavailableSupport = normalizedSupports.filter((supportId) => !availableIds.includes(supportId));
        if (unavailableSupport.length > 0) {
            throw new Error("One or more selected support technicians are not available");
        }

        const interventionId = await this.interventionRepo.createPlannedInterventionWithTechnicians(
            demandeId,
            leadId,
            startString,
            estimatedDuration,
            [{ technicianId: leadId, role: 'lead' },
            ...normalizedSupports.map((supportId): { technicianId: number; role: 'lead' | 'support' } => ({ technicianId: supportId, role: 'support' }))]
        );

        await this.interventionRepo.updateStatus(demandeId, 'validated');

        return interventionId;
    }

    cancelRequest = async (demandeId: number) => {
        const request = await this.interventionRepo.findById(demandeId);
        if (!request) {
            throw new Error("Request not found");
        }

        const activeIntervention = await this.interventionRepo.findActiveInterventionByDemandeId(demandeId);
        if (activeIntervention) {
            await this.interventionRepo.cancelInterventionById(activeIntervention.id);
            return await this.interventionRepo.updateStatus(demandeId, 'created');
        }

        if (request.status === 'cancelled') {
            throw new Error("Request is already cancelled");
        }

        return await this.interventionRepo.updateStatus(demandeId, 'cancelled');
    }

    recoverRequest = async (demandeId: number) => {
        const request = await this.interventionRepo.findById(demandeId);
        if (!request) {
            throw new Error("Request not found");
        }

        if (request.status !== 'cancelled') {
            throw new Error("Only cancelled requests can be recovered");
        }

        return await this.interventionRepo.updateStatus(demandeId, 'created');
    }

    private toSqlDatetime(date: Date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
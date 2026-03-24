// modules/interventions/InterventionService.ts
import { InterventionRepository } from "./IntRepository.js";
import { InterventionRow } from "../../types/int.types.js";

export class InterventionService {
    constructor(private interventionRepo: InterventionRepository) {}

    createIntervention = async (
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
    ) => {
        if (!clientId || !createdBy || !title || !description) {
            throw new Error("Missing required fields");
        }
        return await this.interventionRepo.create(clientId, createdBy, title, description, priority, interventionAddress, latitude, longitude, scheduledStart, scheduledEnd);
    }

    getAllInterventions = async (): Promise<InterventionRow[]> => {
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

    assignTechnician = async (interventionId: number, userId: number) => {
        return await this.interventionRepo.assignTechnician(interventionId, userId);
    }

    startIntervention = async (interventionId: number) => {
        return await this.interventionRepo.setStarted(interventionId, new Date());
    }

    completeIntervention = async (interventionId: number) => {
        return await this.interventionRepo.setCompleted(interventionId, new Date());
    }

    updateIntervention = async (
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
    ) => {
        if (!clientId || !title || !description) {
            throw new Error("Missing required fields");
        }
        return await this.interventionRepo.update(id, clientId, title, description, priority, interventionAddress, latitude, longitude, scheduledStart, scheduledEnd);
    }

    deleteIntervention = async (id: number) => {
        return await this.interventionRepo.delete(id);
    }
}
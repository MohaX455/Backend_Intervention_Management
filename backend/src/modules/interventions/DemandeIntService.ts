// modules/interventions/DemandeIntService.ts
import { DemandeIntRepository } from "./DemandeIntRepository.js";
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

    getRecentInterventions = async (limit: number): Promise<InterventionRow[]> => {
        return await this.interventionRepo.getAll(limit);
    }

    getInterventionById = async (id: number): Promise<InterventionRow> => {
        const intervention = await this.interventionRepo.findById(id);
        if (!intervention) throw new Error("Intervention not found");
        return intervention;
    }

    getAllAssignments = async () => {
        return await this.interventionRepo.getAllAssignments();
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

        return {
            totalInterventions,
            availableTechnicians,
            newInterventions,
            pendingInterventions
        };
    }

    getAvailableTechnicians = async () => {
        return await this.interventionRepo.getAvailableTechnicians();
    }
}
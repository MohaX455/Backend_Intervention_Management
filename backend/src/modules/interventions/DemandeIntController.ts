// modules/interventions/DemandeIntController.ts
import { Request, Response, NextFunction } from "express";
import { DemandeIntService } from "./DemandeIntService.js";
import { logger } from "../../shared/utils/logger.js";

export class DemandeIntController {
    constructor(private interventionService: DemandeIntService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                clientId, createdBy, title, description, priority,
                interventionAddress, latitude, longitude
            } = req.body;

            const id = await this.interventionService.createIntervention(
                clientId, createdBy, title, description, priority,
                interventionAddress, latitude, longitude
            );
            res.status(201).json({ message: "Intervention created", id });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getAll = async (_req: Request, res: Response) => {
        try {
            const interventions = await this.interventionService.getAllInterventions();
            res.status(200).json(interventions);
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getAllAssignments = async (_req: Request, res: Response) => {
        try {
            const assignments = await this.interventionService.getAllAssignments();
            res.status(200).json(assignments);
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getRecent = async (req: Request, res: Response) => {
        try {
            let limit = parseInt(req.query.limit as string);

            if (isNaN(limit) || limit <= 0) {
                limit = 3;
            }

            const interventions = await this.interventionService.getRecentInterventions(limit);
            res.status(200).json(interventions);
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getOne = async (req: Request, res: Response) => {
        try {
            const interventionId = Number(req.params.id);
            const intervention = await this.interventionService.getInterventionById(interventionId);
            res.status(200).json(intervention);
        } catch (err: any) {
            logger.error(err);
            res.status(404).json({ message: err.message });
        }
    }

    assignTechnician = async (req: Request, res: Response) => {
        try {
            const interventionId = Number(req.params.id);
            const { userId } = req.body;
            await this.interventionService.assignTechnician(interventionId, userId);
            res.status(200).json({ message: "Technician assigned" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    startIntervention = async (req: Request, res: Response) => {
        try {
            const interventionId = Number(req.params.id);
            await this.interventionService.startIntervention(interventionId);
            res.status(200).json({ message: "Intervention started" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    completeIntervention = async (req: Request, res: Response) => {
        try {
            const interventionId = Number(req.params.id);
            await this.interventionService.completeIntervention(interventionId);
            res.status(200).json({ message: "Intervention completed" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const interventionId = Number(req.params.id);
            const {
                clientId, title, description, priority,
                interventionAddress, latitude, longitude
            } = req.body;

            await this.interventionService.updateIntervention(
                interventionId, clientId, title, description, priority,
                interventionAddress, latitude, longitude
            );
            res.status(200).json({ message: "Intervention updated" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const interventionId = Number(req.params.id);
            await this.interventionService.deleteIntervention(interventionId);
            res.status(200).json({ message: "Intervention deleted" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getStats = async (_req: Request, res: Response) => {
        try {
            const stats = await this.interventionService.getStats();
            res.status(200).json(stats);
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getAvailableTechnicians = async (_req: Request, res: Response) => {
        try {
            const technicians = await this.interventionService.getAvailableTechnicians();
            res.status(200).json(technicians);
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }
}
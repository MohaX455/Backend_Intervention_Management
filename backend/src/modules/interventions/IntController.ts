// modules/interventions/InterventionController.ts
import { Request, Response, NextFunction } from "express";
import { InterventionService } from "./IntService.js";
import { logger } from "../../shared/utils/logger.js";

export class InterventionController {
    constructor(private interventionService: InterventionService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                clientId, createdBy, title, description, priority,
                interventionAddress, latitude, longitude, scheduledStart, scheduledEnd
            } = req.body;

            const id = await this.interventionService.createIntervention(
                clientId, createdBy, title, description, priority,
                interventionAddress, latitude, longitude,
                scheduledStart ? new Date(scheduledStart) : null,
                scheduledEnd ? new Date(scheduledEnd) : null
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
                interventionAddress, latitude, longitude, scheduledStart, scheduledEnd
            } = req.body;

            await this.interventionService.updateIntervention(
                interventionId, clientId, title, description, priority,
                interventionAddress, latitude, longitude,
                scheduledStart ? new Date(scheduledStart) : null,
                scheduledEnd ? new Date(scheduledEnd) : null
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
}
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

    getAllAssignments = async (req: Request, res: Response) => {
        try {
            let limit = parseInt(req.query.limit as string);
            const assignments = await this.interventionService.getAllAssignments(limit);
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

    getAvailableTechnicians = async (req: Request, res: Response) => {
        try {
            const startTime = req.query.start_time as string | undefined;
            const estimatedDuration = req.query.estimated_duration ? Number(req.query.estimated_duration) : undefined;
            const technicians = await this.interventionService.getAvailableTechnicians(startTime, estimatedDuration);
            res.status(200).json(technicians);
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getRequests = async (_req: Request, res: Response) => {
        try {
            const requests = await this.interventionService.getAdminRequests();
            res.status(200).json(requests);
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    getRequest = async (req: Request, res: Response) => {
        try {
            const requestId = Number(req.params.id);
            if (!requestId || Number.isNaN(requestId)) {
                return res.status(400).json({ message: "Invalid request id" });
            }

            const request = await this.interventionService.getAdminRequestById(requestId);
            res.status(200).json(request);
        } catch (err: any) {
            logger.error(err);
            res.status(404).json({ message: err.message });
        }
    }

    assignRequest = async (req: Request, res: Response) => {
        try {
            const requestId = Number(req.params.id);
            const {
                start_time,
                estimated_duration,
                lead_id,
                support_ids
            } = req.body;

            await this.interventionService.assignRequest(
                requestId,
                start_time,
                Number(estimated_duration),
                Number(lead_id),
                Array.isArray(support_ids) ? support_ids.map(Number) : []
            );

            res.status(201).json({ message: "Request assigned successfully" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    cancelRequest = async (req: Request, res: Response) => {
        try {
            const requestId = Number(req.params.id);
            await this.interventionService.cancelRequest(requestId);
            res.status(200).json({ message: "Request cancelled" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }

    recoverRequest = async (req: Request, res: Response) => {
        try {
            const requestId = Number(req.params.id);
            await this.interventionService.recoverRequest(requestId);
            res.status(200).json({ message: "Request recovered" });
        } catch (err: any) {
            logger.error(err);
            res.status(400).json({ message: err.message });
        }
    }
}
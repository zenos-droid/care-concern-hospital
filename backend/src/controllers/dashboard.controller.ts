import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  admin: async (_req: Request, res: Response) => res.json({ success: true, data: await dashboardService.admin() }),
  doctor: async (req: Request, res: Response) => res.json({ success: true, data: await dashboardService.doctor(req.user!.doctorId!) }),
  reception: async (_req: Request, res: Response) => res.json({ success: true, data: await dashboardService.reception() }),
  patient: async (req: Request, res: Response) => res.json({ success: true, data: await dashboardService.patient(req.user!.patientId!) })
};

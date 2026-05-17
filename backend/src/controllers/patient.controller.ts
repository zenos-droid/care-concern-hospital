import { Request, Response } from "express";
import { patientService } from "../services/patient.service";

export const patientController = {
  list: async (req: Request, res: Response) => res.json({ success: true, data: await patientService.list(req.query.search as string | undefined) }),
  get: async (req: Request, res: Response) => res.json({ success: true, data: await patientService.get(req) }),
  update: async (req: Request, res: Response) => res.json({ success: true, data: await patientService.update(req) })
};

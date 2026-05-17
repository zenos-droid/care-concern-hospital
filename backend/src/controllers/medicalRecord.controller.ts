import { Request, Response } from "express";
import { medicalRecordService } from "../services/medicalRecord.service";

export const medicalRecordController = {
  list: async (req: Request, res: Response) => res.json({ success: true, data: await medicalRecordService.list(req) }),
  create: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await medicalRecordService.create(req) })
};

import { Request, Response } from "express";
import { appointmentService } from "../services/appointment.service";

export const appointmentController = {
  create: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await appointmentService.create(req) }),
  list: async (req: Request, res: Response) => res.json({ success: true, data: await appointmentService.list(req) }),
  update: async (req: Request, res: Response) => res.json({ success: true, data: await appointmentService.update(req) }),
  approve: async (req: Request, res: Response) => res.json({ success: true, data: await appointmentService.approve(req) }),
  cancel: async (req: Request, res: Response) => res.json({ success: true, data: await appointmentService.cancel(req) }),
  checkIn: async (req: Request, res: Response) => res.json({ success: true, data: await appointmentService.checkIn(req) }),
  queue: async (req: Request, res: Response) => res.json({ success: true, data: await appointmentService.queue(req) })
};

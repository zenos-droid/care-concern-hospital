import { Request, Response } from "express";
import { publicService } from "../services/public.service";

export const publicController = {
  departments: async (_req: Request, res: Response) => res.json({ success: true, data: await publicService.departments() }),
  doctors: async (req: Request, res: Response) => res.json({ success: true, data: await publicService.doctors(req.query as Record<string, string>) }),
  chatbot: async (req: Request, res: Response) => res.json({ success: true, data: { reply: await publicService.chatbot(req.body.message) } })
};

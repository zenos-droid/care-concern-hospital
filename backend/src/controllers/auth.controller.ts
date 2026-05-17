import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  signup: async (req: Request, res: Response) => res.status(201).json({ success: true, data: await authService.signup(req) }),
  login: async (req: Request, res: Response) => res.json({ success: true, data: await authService.login(req) }),
  refresh: async (req: Request, res: Response) => res.json({ success: true, data: await authService.refresh(req.body.refreshToken) }),
  logout: async (req: Request, res: Response) => res.json({ success: true, data: await authService.logout(req, req.body.refreshToken) }),
  forgotPassword: async (req: Request, res: Response) => res.json({ success: true, data: await authService.forgotPassword(req.body.identifier) }),
  resetPassword: async (req: Request, res: Response) => res.json({ success: true, data: await authService.resetPassword(req) }),
  me: async (req: Request, res: Response) => res.json({ success: true, data: await authService.getMe(req.user!.id) })
};

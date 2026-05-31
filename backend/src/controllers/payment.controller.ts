import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  createOrder: async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await paymentService.createOrder(req.body.amount, req.body.appointment) });
  },
  verify: async (req: Request, res: Response) => {
    res.json({ success: true, data: await paymentService.verifyPayment(req.body) });
  },
  list: async (req: Request, res: Response) => {
    res.json({ success: true, data: await paymentService.listForUser(req.user) });
  },
  analytics: async (_req: Request, res: Response) => {
    res.json({ success: true, data: await paymentService.adminAnalytics() });
  },
  refund: async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await paymentService.refund(req.params.id, req.body.amount, req.body.reason, req.user?.id) });
  },
  ticket: async (req: Request, res: Response) => {
    res.type("html").send(await paymentService.ticketHtml(req.params.id));
  },
  receipt: async (req: Request, res: Response) => {
    res.type("html").send(await paymentService.receiptHtml(req.params.id));
  }
};

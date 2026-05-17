import { Request, Response } from "express";
import { badRequest } from "../utils/errors";
import { storageService } from "../services/storage.service";

export const uploadController = {
  upload: async (req: Request, res: Response) => {
    if (!req.file) throw badRequest("File is required");
    res.status(201).json({ success: true, data: await storageService.save(req.file) });
  }
};

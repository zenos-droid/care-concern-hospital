import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message, details: err.details } });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Validation failed", details: err.flatten() } });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Duplicate value", details: err.meta } });
    if (err.code === "P2025") return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Resource not found" } });
  }

  logger.error("Unhandled API error", { err, requestId: req.requestId, path: req.path });
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Internal server error" : err instanceof Error ? err.message : "Unknown error"
    }
  });
};

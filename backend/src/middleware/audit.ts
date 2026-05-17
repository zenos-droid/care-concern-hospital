import { AuditAction } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const writeAuditLog = async (req: Request, action: AuditAction, entity: string, entityId?: string, metadata?: unknown) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id,
        action,
        entity,
        entityId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        metadata: metadata as object
      }
    });
  } catch (error) {
    logger.warn("Audit log write failed", { error });
  }
};

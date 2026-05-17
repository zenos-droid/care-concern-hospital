import { Role } from "@prisma/client";
import { Router } from "express";
import { medicalRecordController } from "../controllers/medicalRecord.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createMedicalRecordSchema, listMedicalRecordsSchema } from "../validators/medicalRecord.validator";

export const medicalRecordRouter = Router();

medicalRecordRouter.use(authenticate);
medicalRecordRouter.get("/", validate(listMedicalRecordsSchema), asyncHandler(medicalRecordController.list));
medicalRecordRouter.post("/", requireRoles(Role.ADMIN, Role.DOCTOR), validate(createMedicalRecordSchema), asyncHandler(medicalRecordController.create));

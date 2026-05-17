import { Role } from "@prisma/client";
import { Router } from "express";
import { patientController } from "../controllers/patient.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { listPatientsSchema, patientIdSchema, updatePatientSchema } from "../validators/patient.validator";

export const patientRouter = Router();

patientRouter.use(authenticate);
patientRouter.get("/", requireRoles(Role.ADMIN, Role.RECEPTIONIST), validate(listPatientsSchema), asyncHandler(patientController.list));
patientRouter.get("/:id", validate(patientIdSchema), asyncHandler(patientController.get));
patientRouter.patch("/:id", validate(updatePatientSchema), asyncHandler(patientController.update));

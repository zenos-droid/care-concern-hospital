import { Role } from "@prisma/client";
import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { appointmentIdSchema, cancelAppointmentSchema, createAppointmentSchema, listAppointmentsSchema, updateAppointmentSchema } from "../validators/appointment.validator";

export const appointmentRouter = Router();

appointmentRouter.use(authenticate);
appointmentRouter.get("/", validate(listAppointmentsSchema), asyncHandler(appointmentController.list));
appointmentRouter.post("/", validate(createAppointmentSchema), asyncHandler(appointmentController.create));
appointmentRouter.get("/queue", requireRoles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST), asyncHandler(appointmentController.queue));
appointmentRouter.patch("/:id", validate(updateAppointmentSchema), asyncHandler(appointmentController.update));
appointmentRouter.post("/:id/approve", requireRoles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST), validate(appointmentIdSchema), asyncHandler(appointmentController.approve));
appointmentRouter.post("/:id/cancel", validate(cancelAppointmentSchema), asyncHandler(appointmentController.cancel));
appointmentRouter.post("/:id/check-in", requireRoles(Role.ADMIN, Role.RECEPTIONIST), validate(appointmentIdSchema), asyncHandler(appointmentController.checkIn));

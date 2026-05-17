import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller";
import { publicController } from "../controllers/public.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createAppointmentSchema } from "../validators/appointment.validator";
import { chatbotSchema } from "../validators/public.validator";

export const publicRouter = Router();

publicRouter.get("/departments", asyncHandler(publicController.departments));
publicRouter.get("/doctors", asyncHandler(publicController.doctors));
publicRouter.post("/appointments", validate(createAppointmentSchema), asyncHandler(appointmentController.create));
publicRouter.post("/chatbot", validate(chatbotSchema), asyncHandler(publicController.chatbot));

import { Role } from "@prisma/client";
import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get("/admin", requireRoles(Role.ADMIN), asyncHandler(dashboardController.admin));
dashboardRouter.get("/doctor", requireRoles(Role.DOCTOR), asyncHandler(dashboardController.doctor));
dashboardRouter.get("/reception", requireRoles(Role.RECEPTIONIST, Role.ADMIN), asyncHandler(dashboardController.reception));
dashboardRouter.get("/patient", requireRoles(Role.PATIENT), asyncHandler(dashboardController.patient));

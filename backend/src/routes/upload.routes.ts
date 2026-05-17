import multer from "multer";
import { Role } from "@prisma/client";
import { Router } from "express";
import { uploadController } from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { asyncHandler } from "../utils/asyncHandler";

const upload = multer({ dest: "uploads/tmp", limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadRouter = Router();

uploadRouter.post("/", authenticate, requireRoles(Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST), upload.single("file"), asyncHandler(uploadController.upload));

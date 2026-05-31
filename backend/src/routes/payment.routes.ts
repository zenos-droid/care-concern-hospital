import { Role } from "@prisma/client";
import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createPaymentOrderSchema, paymentIdSchema, refundSchema, verifyPaymentSchema } from "../validators/payment.validator";

export const paymentRouter = Router();

paymentRouter.post("/create-order", validate(createPaymentOrderSchema), asyncHandler(paymentController.createOrder));
paymentRouter.post("/verify", validate(verifyPaymentSchema), asyncHandler(paymentController.verify));
paymentRouter.get("/", authenticate, asyncHandler(paymentController.list));
paymentRouter.get("/analytics", authenticate, requireRoles(Role.ADMIN), asyncHandler(paymentController.analytics));
paymentRouter.post("/:id/refund", authenticate, requireRoles(Role.ADMIN), validate(refundSchema), asyncHandler(paymentController.refund));
paymentRouter.get("/:id/ticket", validate(paymentIdSchema), asyncHandler(paymentController.ticket));
paymentRouter.get("/:id/receipt", validate(paymentIdSchema), asyncHandler(paymentController.receipt));

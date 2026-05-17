import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { forgotPasswordSchema, loginSchema, refreshSchema, resetPasswordSchema, signupSchema } from "../validators/auth.validator";

export const authRouter = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email or phone and password.
 */
authRouter.post("/signup", authRateLimiter, validate(signupSchema), asyncHandler(authController.signup));
authRouter.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh", validate(refreshSchema), asyncHandler(authController.refresh));
authRouter.post("/logout", authenticate, asyncHandler(authController.logout));
authRouter.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
authRouter.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
authRouter.get("/me", authenticate, asyncHandler(authController.me));

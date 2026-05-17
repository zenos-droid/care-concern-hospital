import { Role } from "@prisma/client";
import { z } from "zod";

const password = z.string().min(8).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/);
const phone = z.string().regex(/^[0-9]{10,15}$/);

export const signupSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email().optional(),
    phone: phone.optional(),
    password,
    role: z.nativeEnum(Role).default(Role.PATIENT)
  }).refine((data) => data.email || data.phone, { message: "Email or phone is required" })
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3).max(160),
    password: z.string().min(1)
  })
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(20) })
});

export const forgotPasswordSchema = z.object({
  body: z.object({ identifier: z.string().min(3).max(160) })
});

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().min(20), password })
});

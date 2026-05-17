import { z } from "zod";

export const listPatientsSchema = z.object({
  query: z.object({
    search: z.string().max(120).optional()
  })
});

export const patientIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const updatePatientSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    fullName: z.string().min(2).max(120).optional(),
    phone: z.string().regex(/^[0-9]{10,15}$/).optional(),
    email: z.string().email().optional(),
    age: z.coerce.number().int().min(0).max(130).optional(),
    gender: z.string().max(40).optional(),
    address: z.string().max(500).optional(),
    emergencyPhone: z.string().regex(/^[0-9]{10,15}$/).optional()
  })
});

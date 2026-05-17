import { z } from "zod";

export const createMedicalRecordSchema = z.object({
  body: z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().optional(),
    diagnosis: z.string().min(2).max(3000),
    prescription: z.string().max(5000).optional(),
    notes: z.string().max(5000).optional(),
    followUpDate: z.coerce.date().optional()
  })
});

export const listMedicalRecordsSchema = z.object({
  query: z.object({
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional()
  })
});

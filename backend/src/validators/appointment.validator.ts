import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    patientName: z.string().min(2).max(120),
    patientPhone: z.string().regex(/^[0-9]{10,15}$/),
    patientAge: z.coerce.number().int().min(0).max(130).optional(),
    patientEmail: z.string().email().optional(),
    doctorId: z.string().uuid().optional(),
    doctorPublicId: z.string().min(3).optional(),
    departmentId: z.string().uuid().optional(),
    departmentSlug: z.string().min(2).optional(),
    scheduledDate: z.coerce.date().optional(),
    slot: z.string().min(1).max(40).optional(),
    symptoms: z.string().max(2000).optional()
  }).refine((data) => data.doctorId || data.doctorPublicId, { message: "Doctor is required" })
});

export const listAppointmentsSchema = z.object({
  query: z.object({
    status: z.nativeEnum(AppointmentStatus).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    doctorId: z.string().uuid().optional(),
    patientId: z.string().uuid().optional()
  })
});

export const appointmentIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const updateAppointmentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    scheduledDate: z.coerce.date().optional(),
    slot: z.string().min(1).max(40).optional(),
    symptoms: z.string().max(2000).optional(),
    notes: z.string().max(2000).optional(),
    status: z.nativeEnum(AppointmentStatus).optional()
  })
});

export const cancelAppointmentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ reason: z.string().min(2).max(500) })
});

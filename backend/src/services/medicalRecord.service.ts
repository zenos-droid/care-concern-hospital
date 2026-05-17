import { Role } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../config/prisma";
import { forbidden } from "../utils/errors";

export class MedicalRecordService {
  list(req: Request) {
    const patientId = req.user?.role === Role.PATIENT ? req.user.patientId ?? undefined : (req.query.patientId as string | undefined);
    const doctorId = req.user?.role === Role.DOCTOR ? req.user.doctorId ?? undefined : (req.query.doctorId as string | undefined);
    return prisma.medicalRecord.findMany({ where: { patientId, doctorId }, include: { patient: true, doctor: true, appointment: true }, orderBy: { createdAt: "desc" } });
  }

  async create(req: Request) {
    const doctorId = req.user?.role === Role.DOCTOR ? req.user.doctorId : req.body.doctorId;
    if (!doctorId) throw forbidden("Doctor context is required");
    return prisma.medicalRecord.create({ data: { ...req.body, doctorId }, include: { patient: true, doctor: true, appointment: true } });
  }
}

export const medicalRecordService = new MedicalRecordService();

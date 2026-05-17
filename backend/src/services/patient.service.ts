import { Role } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../config/prisma";
import { forbidden, notFound } from "../utils/errors";

export class PatientService {
  list(search?: string) {
    return prisma.patient.findMany({
      where: search ? { OR: [{ fullName: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }, { patientCode: { contains: search, mode: "insensitive" } }] } : undefined,
      orderBy: { createdAt: "desc" }
    });
  }

  async get(req: Request) {
    if (req.user?.role === Role.PATIENT && req.user.patientId !== req.params.id) throw forbidden();
    const patient = await prisma.patient.findUnique({ where: { id: req.params.id }, include: { appointments: true, medicalRecords: true } });
    if (!patient) throw notFound("Patient not found");
    return patient;
  }

  async update(req: Request) {
    if (req.user?.role === Role.PATIENT && req.user.patientId !== req.params.id) throw forbidden();
    return prisma.patient.update({ where: { id: req.params.id }, data: req.body });
  }
}

export const patientService = new PatientService();

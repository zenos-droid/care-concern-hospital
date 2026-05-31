import { AppointmentStatus, AuditAction, Prisma, Role } from "@prisma/client";
import dayjs from "dayjs";
import { Request } from "express";
import { prisma } from "../config/prisma";
import { writeAuditLog } from "../middleware/audit";
import { badRequest, conflict, forbidden, notFound } from "../utils/errors";
import { generatePatientCode, generateTicketNumber } from "../utils/crypto";
import { notificationService } from "./notification.service";

const appointmentInclude = { patient: true, doctor: { include: { department: true } }, department: true };
type AppointmentBookingInput = {
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientEmail?: string;
  doctorId?: string;
  doctorPublicId?: string;
  scheduledDate?: string | Date;
  slot?: string;
  symptoms?: string;
};

export class AppointmentService {
  async create(req: Request) {
    const appointment = await this.createFromBooking(req.body, req.user?.id);
    await writeAuditLog(req, AuditAction.CREATE, "Appointment", appointment.id);
    await notificationService.appointmentBooked(appointment.patient.email ?? appointment.patient.phone, appointment.ticketNumber, appointment.patient.userId ?? undefined);
    return appointment;
  }

  async createFromBooking(body: AppointmentBookingInput, createdById?: string, client: Prisma.TransactionClient | typeof prisma = prisma) {
    const doctor = await client.doctor.findFirst({
      where: { OR: [{ id: body.doctorId }, { publicId: body.doctorPublicId }], isActive: true },
      include: { department: true }
    });
    if (!doctor) throw notFound("Doctor not found");

    const scheduledDate = body.scheduledDate ? dayjs(body.scheduledDate).startOf("day").toDate() : dayjs().add(1, "day").startOf("day").toDate();
    if (dayjs(scheduledDate).isBefore(dayjs().startOf("day"))) throw badRequest("Appointment date cannot be in the past");
    const slot = body.slot || doctor.slots[0] || "General OPD Hours";
    if (body.slot && !doctor.slots.includes(body.slot)) throw badRequest("Selected slot is not available for this doctor");

    const patient = await client.patient.upsert({
      where: { patientCode: `PHONE-${body.patientPhone}` },
      update: { fullName: body.patientName, phone: body.patientPhone, email: body.patientEmail, age: body.patientAge },
      create: { patientCode: `PHONE-${body.patientPhone}`, fullName: body.patientName, phone: body.patientPhone, email: body.patientEmail, age: body.patientAge }
    });

    const taken = await client.appointment.findFirst({
      where: { doctorId: doctor.id, scheduledDate, slot, status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] } }
    });
    if (taken) throw conflict("This appointment slot has already been reserved");

    return client.appointment.create({
      data: {
        ticketNumber: generateTicketNumber(),
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        scheduledDate,
        slot,
        symptoms: body.symptoms,
        createdById
      },
      include: appointmentInclude
    });
  }

  list(req: Request) {
    const { status, from, to, doctorId, patientId } = req.query as Record<string, string | undefined>;
    const scopedDoctorId = req.user?.role === Role.DOCTOR ? req.user.doctorId ?? undefined : doctorId;
    const scopedPatientId = req.user?.role === Role.PATIENT ? req.user.patientId ?? undefined : patientId;
    return prisma.appointment.findMany({
      where: {
        status: status as AppointmentStatus | undefined,
        doctorId: scopedDoctorId,
        patientId: scopedPatientId,
        scheduledDate: from || to ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } : undefined
      },
      include: appointmentInclude,
      orderBy: [{ scheduledDate: "asc" }, { slot: "asc" }]
    });
  }

  async update(req: Request) {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id }, include: appointmentInclude });
    if (!existing) throw notFound("Appointment not found");
    this.assertCanAccess(req, existing.doctorId, existing.patientId);

    const data = { ...req.body };
    if (data.scheduledDate) data.scheduledDate = dayjs(data.scheduledDate).startOf("day").toDate();
    const appointment = await prisma.appointment.update({ where: { id: existing.id }, data, include: appointmentInclude });
    await writeAuditLog(req, AuditAction.UPDATE, "Appointment", appointment.id, data);
    return appointment;
  }

  async approve(req: Request) {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: AppointmentStatus.APPROVED, approvedAt: new Date() },
      include: appointmentInclude
    });
    await writeAuditLog(req, AuditAction.APPROVE, "Appointment", appointment.id);
    return appointment;
  }

  async cancel(req: Request) {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Appointment not found");
    this.assertCanAccess(req, existing.doctorId, existing.patientId);
    const appointment = await prisma.appointment.update({
      where: { id: existing.id },
      data: { status: AppointmentStatus.CANCELLED, cancelReason: req.body.reason, cancelledAt: new Date() },
      include: appointmentInclude
    });
    await writeAuditLog(req, AuditAction.CANCEL, "Appointment", appointment.id, { reason: req.body.reason });
    await notificationService.appointmentCancelled(appointment.patient.email ?? appointment.patient.phone, appointment.ticketNumber, appointment.patient.userId ?? undefined);
    return appointment;
  }

  async checkIn(req: Request) {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Appointment not found");
    const queueNumber = await prisma.appointment.count({
      where: { doctorId: existing.doctorId, scheduledDate: existing.scheduledDate, status: { in: [AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_CONSULTATION] } }
    }) + 1;
    const appointment = await prisma.appointment.update({
      where: { id: existing.id },
      data: { status: AppointmentStatus.CHECKED_IN, checkedInAt: new Date(), queueNumber },
      include: appointmentInclude
    });
    await writeAuditLog(req, AuditAction.CHECK_IN, "Appointment", appointment.id, { queueNumber });
    return appointment;
  }

  queue(req: Request) {
    const doctorId = req.user?.role === Role.DOCTOR ? req.user.doctorId ?? undefined : (req.query.doctorId as string | undefined);
    return prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledDate: dayjs(req.query.date as string | undefined).isValid() ? dayjs(req.query.date as string).startOf("day").toDate() : dayjs().startOf("day").toDate(),
        status: { in: [AppointmentStatus.APPROVED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_CONSULTATION] }
      },
      include: appointmentInclude,
      orderBy: [{ queueNumber: "asc" }, { slot: "asc" }]
    });
  }

  private assertCanAccess(req: Request, doctorId: string, patientId: string) {
    if (req.user?.role === Role.ADMIN || req.user?.role === Role.RECEPTIONIST) return;
    if (req.user?.role === Role.DOCTOR && req.user.doctorId === doctorId) return;
    if (req.user?.role === Role.PATIENT && req.user.patientId === patientId) return;
    throw forbidden();
  }
}

export const appointmentService = new AppointmentService();

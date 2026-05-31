import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "../config/prisma";

export class DashboardService {
  async admin() {
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();
    const [totalPatients, totalAppointments, todaysAppointments, doctorAnalytics, paidPayments, failedPayments, refunds] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { scheduledDate: { gte: todayStart, lte: todayEnd } } }),
      prisma.doctor.findMany({
        include: {
          department: true,
          _count: { select: { appointments: true, medicalRecords: true } }
        },
        orderBy: { fullName: "asc" }
      }),
      prisma.payment.findMany({ where: { status: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED] } }, include: { appointment: { include: { department: true, doctor: true } } } }),
      prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      prisma.refund.findMany({ orderBy: { createdAt: "desc" }, take: 10 })
    ]);
    const revenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const departmentRevenue = paidPayments.reduce<Record<string, number>>((acc, payment) => {
      const key = payment.appointment?.department?.name ?? "Unassigned";
      acc[key] = (acc[key] ?? 0) + payment.amount;
      return acc;
    }, {});
    return { totalPatients, totalAppointments, todaysAppointments, doctorAnalytics, revenue, failedPayments, refunds, departmentRevenue };
  }

  async doctor(doctorId: string) {
    const today = dayjs().startOf("day").toDate();
    const [todayQueue, pendingApprovals, completedThisMonth, upcoming] = await Promise.all([
      prisma.appointment.count({ where: { doctorId, scheduledDate: today, status: { in: [AppointmentStatus.APPROVED, AppointmentStatus.CHECKED_IN] } } }),
      prisma.appointment.count({ where: { doctorId, status: AppointmentStatus.PENDING } }),
      prisma.appointment.count({ where: { doctorId, status: AppointmentStatus.COMPLETED, scheduledDate: { gte: dayjs().startOf("month").toDate() } } }),
      prisma.appointment.findMany({ where: { doctorId, scheduledDate: { gte: today } }, include: { patient: true, department: true }, orderBy: [{ scheduledDate: "asc" }, { slot: "asc" }], take: 10 })
    ]);
    return { todayQueue, pendingApprovals, completedThisMonth, upcoming };
  }

  async reception() {
    const today = dayjs().startOf("day").toDate();
    const [pending, checkedIn, todaysAppointments, recentPatients] = await Promise.all([
      prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
      prisma.appointment.count({ where: { scheduledDate: today, status: AppointmentStatus.CHECKED_IN } }),
      prisma.appointment.findMany({ where: { scheduledDate: today }, include: { patient: true, doctor: true, department: true }, orderBy: [{ slot: "asc" }] }),
      prisma.patient.findMany({ orderBy: { createdAt: "desc" }, take: 10 })
    ]);
    return { pending, checkedIn, todaysAppointments, recentPatients };
  }

  async patient(patientId: string) {
    const [upcoming, records, notifications, payments] = await Promise.all([
      prisma.appointment.findMany({ where: { patientId, scheduledDate: { gte: dayjs().startOf("day").toDate() } }, include: { doctor: true, department: true }, orderBy: { scheduledDate: "asc" } }),
      prisma.medicalRecord.findMany({ where: { patientId }, include: { doctor: true }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.notification.findMany({ where: { user: { patient: { id: patientId } } }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.payment.findMany({ where: { patientId }, include: { appointment: { include: { doctor: true, department: true } }, refunds: true }, orderBy: { createdAt: "desc" }, take: 20 })
    ]);
    return { upcoming, records, notifications, payments };
  }
}

export const dashboardService = new DashboardService();

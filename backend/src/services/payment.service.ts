import { AuditAction, PaymentStatus, RefundStatus } from "@prisma/client";
import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { badRequest, conflict, notFound } from "../utils/errors";
import { appointmentService } from "./appointment.service";
import { notificationService } from "./notification.service";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || "rzp_test_missing",
  key_secret: env.RAZORPAY_KEY_SECRET || "missing_secret"
});

type AppointmentDraft = {
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

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export class PaymentService {
  async createOrder(amount: number, appointment: AppointmentDraft) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) throw badRequest("Razorpay is not configured");

    const patient = await prisma.patient.upsert({
      where: { patientCode: `PHONE-${appointment.patientPhone}` },
      update: {
        fullName: appointment.patientName,
        phone: appointment.patientPhone,
        email: appointment.patientEmail,
        age: appointment.patientAge
      },
      create: {
        patientCode: `PHONE-${appointment.patientPhone}`,
        fullName: appointment.patientName,
        phone: appointment.patientPhone,
        email: appointment.patientEmail,
        age: appointment.patientAge
      }
    });

    const receiptNumber = `CCH-${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: receiptNumber,
      notes: {
        patientId: patient.id,
        patientPhone: appointment.patientPhone
      }
    });

    await prisma.payment.create({
      data: {
        patientId: patient.id,
        amount,
        currency: order.currency,
        providerOrderId: order.id,
        receiptNumber,
        notes: { appointment }
      }
    });

    return order;
  }

  async verifyPayment(input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    const payment = await prisma.payment.findUnique({ where: { providerOrderId: input.razorpay_order_id } });
    if (!payment) throw notFound("Payment order not found");
    if (payment.status === PaymentStatus.PAID && payment.appointmentId) {
      return this.getPayment(payment.id);
    }

    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
      .digest("hex");
    const actual = Buffer.from(input.razorpay_signature);
    const signed = Buffer.from(expected);
    if (actual.length !== signed.length || !crypto.timingSafeEqual(actual, signed)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failedAt: new Date(), providerPaymentId: input.razorpay_payment_id }
      });
      throw badRequest("Payment verification failed");
    }

    const notes = payment.notes as { appointment?: AppointmentDraft } | null;
    if (!notes?.appointment) throw badRequest("Appointment draft missing for this payment");
    const appointmentDraft = notes.appointment;

    const saved = await prisma.$transaction(async (tx) => {
      const fresh = await tx.payment.findUnique({ where: { id: payment.id } });
      if (!fresh) throw notFound("Payment order not found");
      if (fresh.status === PaymentStatus.PAID && fresh.appointmentId) return fresh;
      if (fresh.providerPaymentId && fresh.providerPaymentId !== input.razorpay_payment_id) throw conflict("Payment order already processed");

      const appointment = await appointmentService.createFromBooking(appointmentDraft, undefined, tx);
      await tx.auditLog.create({
        data: {
          action: AuditAction.PAYMENT,
          entity: "Payment",
          entityId: fresh.id,
          metadata: { appointmentId: appointment.id, providerOrderId: input.razorpay_order_id }
        }
      });
      await tx.auditLog.create({
        data: {
          action: AuditAction.CREATE,
          entity: "Appointment",
          entityId: appointment.id,
          metadata: { source: "razorpay_verified_payment", paymentId: fresh.id }
        }
      });

      return tx.payment.update({
        where: { id: fresh.id },
        data: {
          appointmentId: appointment.id,
          providerPaymentId: input.razorpay_payment_id,
          providerSignature: input.razorpay_signature,
          status: PaymentStatus.PAID,
          paidAt: new Date()
        }
      });
    });

    const hydrated = await this.getPayment(saved.id);
    if (hydrated.appointment) {
      await notificationService.appointmentBooked(hydrated.patient.email ?? hydrated.patient.phone, hydrated.appointment.ticketNumber, hydrated.patient.userId ?? undefined);
      await notificationService.paymentConfirmed(hydrated.patient.email ?? hydrated.patient.phone, hydrated.receiptNumber, hydrated.amount, hydrated.patient.userId ?? undefined);
    }
    return hydrated;
  }

  getPayment(id: string) {
    return prisma.payment.findUniqueOrThrow({
      where: { id },
      include: {
        patient: true,
        appointment: { include: { patient: true, doctor: { include: { department: true } }, department: true } },
        refunds: true
      }
    });
  }

  listForUser(user?: { role?: string; patientId?: string | null }) {
    return prisma.payment.findMany({
      where: user?.role === "PATIENT" ? { patientId: user.patientId ?? undefined } : undefined,
      include: { appointment: { include: { doctor: true, department: true } }, refunds: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async adminAnalytics() {
    const [payments, failed, refunds] = await Promise.all([
      prisma.payment.findMany({ where: { status: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED] } }, include: { appointment: { include: { department: true, doctor: true } } } }),
      prisma.payment.findMany({ where: { status: PaymentStatus.FAILED }, orderBy: { createdAt: "desc" }, take: 25 }),
      prisma.refund.findMany({ include: { payment: true }, orderBy: { createdAt: "desc" }, take: 25 })
    ]);
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const byDepartment = payments.reduce<Record<string, number>>((acc, payment) => {
      const key = payment.appointment?.department?.name ?? "Unassigned";
      acc[key] = (acc[key] ?? 0) + payment.amount;
      return acc;
    }, {});
    return { totalRevenue, paidCount: payments.length, failed, refunds, byDepartment };
  }

  async refund(paymentId: string, amount: number | undefined, reason: string, createdById?: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { refunds: true } });
    if (!payment) throw notFound("Payment not found");
    if (payment.status !== PaymentStatus.PAID && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) throw badRequest("Only paid payments can be refunded");
    const refunded = payment.refunds
      .filter((refund) => refund.status === RefundStatus.PROCESSED || refund.status === RefundStatus.PROCESSING)
      .reduce((sum, refund) => sum + refund.amount, 0);
    const refundAmount = amount ?? payment.amount - refunded;
    if (refundAmount <= 0 || refundAmount > payment.amount - refunded) throw badRequest("Invalid refund amount");

    const refund = await prisma.refund.create({
      data: {
        paymentId: payment.id,
        appointmentId: payment.appointmentId,
        amount: refundAmount,
        reason,
        status: RefundStatus.PROCESSING,
        createdById
      }
    });
    await prisma.auditLog.create({ data: { actorId: createdById, action: AuditAction.REFUND, entity: "Refund", entityId: refund.id, metadata: { paymentId, refundAmount } } });

    const nextStatus = refundAmount + refunded >= payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    await prisma.payment.update({ where: { id: payment.id }, data: { status: nextStatus } });
    return refund;
  }

  async ticketHtml(paymentId: string) {
    const payment = await this.getPayment(paymentId);
    if (!payment.appointment) throw notFound("Ticket is not available for this payment");
    const appointment = payment.appointment;
    const qrPayload = encodeURIComponent(`${env.API_BASE_URL}/api/v1/payments/${payment.id}/ticket`);
    return this.printableHtml("Appointment Ticket", `
      <section class="hero">
        <div>
          <p class="eyebrow">Care Concern Hospital</p>
          <h1>Appointment Ticket</h1>
          <p>Serampore Clinical Branch</p>
        </div>
        <img alt="QR code" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrPayload}" />
      </section>
      <dl>
        <div><dt>Ticket Number</dt><dd>${escapeHtml(appointment.ticketNumber)}</dd></div>
        <div><dt>Patient</dt><dd>${escapeHtml(appointment.patient.fullName)}</dd></div>
        <div><dt>Doctor</dt><dd>${escapeHtml(appointment.doctor.fullName)}</dd></div>
        <div><dt>Department</dt><dd>${escapeHtml(appointment.department.name)}</dd></div>
        <div><dt>Date</dt><dd>${escapeHtml(appointment.scheduledDate.toDateString())}</dd></div>
        <div><dt>Time Slot</dt><dd>${escapeHtml(appointment.slot)}</dd></div>
        <div><dt>Payment Status</dt><dd>${escapeHtml(payment.status)}</dd></div>
        <div><dt>Booked At</dt><dd>${escapeHtml(appointment.createdAt.toLocaleString())}</dd></div>
      </dl>
    `);
  }

  async receiptHtml(paymentId: string) {
    const payment = await this.getPayment(paymentId);
    return this.printableHtml("Payment Receipt", `
      <section class="hero">
        <div>
          <p class="eyebrow">Care Concern Hospital</p>
          <h1>Payment Receipt</h1>
          <p>GST placeholder: GSTIN to be updated by accounts</p>
        </div>
      </section>
      <dl>
        <div><dt>Receipt ID</dt><dd>${escapeHtml(payment.receiptNumber)}</dd></div>
        <div><dt>Payment ID</dt><dd>${escapeHtml(payment.providerPaymentId ?? payment.providerOrderId)}</dd></div>
        <div><dt>Amount</dt><dd>INR ${escapeHtml(payment.amount)}</dd></div>
        <div><dt>Date</dt><dd>${escapeHtml((payment.paidAt ?? payment.createdAt).toLocaleString())}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(payment.status)}</dd></div>
        <div><dt>Patient</dt><dd>${escapeHtml(payment.patient.fullName)}</dd></div>
      </dl>
    `);
  }

  private printableHtml(title: string, body: string) {
    return `<!doctype html>
<html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>
<style>
body{font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:32px}.page{max-width:760px;margin:auto;background:white;border:1px solid #dbe3ef;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,.12)}.hero{display:flex;justify-content:space-between;gap:24px;align-items:center;background:linear-gradient(135deg,#0369a1,#047857);color:white;padding:28px}.eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:11px;font-weight:800;margin:0 0 8px}h1{margin:0;font-size:30px}dl{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:28px}dt{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#64748b;font-weight:800}dd{margin:4px 0 0;font-size:16px;font-weight:800}.actions{padding:0 28px 28px}button{background:#0369a1;color:white;border:0;border-radius:12px;padding:12px 18px;font-weight:800}@media print{body{background:white;padding:0}.page{box-shadow:none;border:0;border-radius:0}.actions{display:none}}</style>
</head><body><main class="page">${body}<div class="actions"><button onclick="window.print()">Print or Save as PDF</button></div></main></body></html>`;
  }
}

export const paymentService = new PaymentService();

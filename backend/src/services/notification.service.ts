import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { emailService } from "./email.service";

export class NotificationService {
  async appointmentBooked(recipient: string, ticketNumber: string, userId?: string) {
    const message = `Your Care Concern Hospital appointment is reserved. Ticket: ${ticketNumber}. Please report 15 minutes before your slot.`;
    if (recipient.includes("@")) return emailService.sendMail(recipient, "Appointment Reserved", message, userId);
    return prisma.notification.create({
      data: { userId, channel: NotificationChannel.SMS, recipient, message, status: NotificationStatus.PENDING, metadata: { provider: "sms-adapter-ready" } }
    });
  }

  async paymentConfirmed(recipient: string, receiptNumber: string, amount: number, userId?: string) {
    const message = `Payment of INR ${amount} confirmed at Care Concern Hospital. Receipt: ${receiptNumber}.`;
    if (recipient.includes("@")) return emailService.sendMail(recipient, "Payment Confirmation", message, userId);
    return prisma.notification.create({
      data: { userId, channel: NotificationChannel.WHATSAPP, recipient, message, status: NotificationStatus.PENDING, metadata: { template: "payment_confirmation" } }
    });
  }

  async appointmentCancelled(recipient: string, ticketNumber: string, userId?: string) {
    const message = `Your Care Concern Hospital appointment ${ticketNumber} has been cancelled. Refund updates will follow if payment was collected.`;
    if (recipient.includes("@")) return emailService.sendMail(recipient, "Appointment Cancelled", message, userId);
    return prisma.notification.create({
      data: { userId, channel: NotificationChannel.WHATSAPP, recipient, message, status: NotificationStatus.PENDING, metadata: { template: "appointment_cancellation" } }
    });
  }

  async inApp(userId: string, message: string, metadata?: object) {
    return prisma.notification.create({
      data: { userId, channel: NotificationChannel.IN_APP, recipient: userId, message, metadata }
    });
  }
}

export const notificationService = new NotificationService();

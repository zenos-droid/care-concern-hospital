import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { env } from "../config/env";
import { mailTransport } from "../config/mail";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export class EmailService {
  async sendMail(to: string, subject: string, message: string, userId?: string) {
    const notification = await prisma.notification.create({
      data: { userId, channel: NotificationChannel.EMAIL, recipient: to, subject, message }
    });

    if (!env.ENABLE_EMAIL_DELIVERY) {
      return prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.SENT, sentAt: new Date(), metadata: { delivery: "disabled-dev-log" } }
      });
    }

    try {
      await mailTransport.sendMail({ from: env.MAIL_FROM, to, subject, text: message });
      return prisma.notification.update({ where: { id: notification.id }, data: { status: NotificationStatus.SENT, sentAt: new Date() } });
    } catch (error) {
      logger.error("Email delivery failed", { error, to, subject });
      await prisma.notification.update({ where: { id: notification.id }, data: { status: NotificationStatus.FAILED, metadata: { error: String(error) } } });
      throw error;
    }
  }
}

export const emailService = new EmailService();

import { AuditAction, Role } from "@prisma/client";
import dayjs from "dayjs";
import { Request } from "express";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { writeAuditLog } from "../middleware/audit";
import { conflict, notFound, unauthorized } from "../utils/errors";
import { randomToken, sha256 } from "../utils/crypto";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { emailService } from "./email.service";

const publicUser = (user: { id: string; email: string | null; phone: string | null; fullName: string; role: Role }) => ({
  id: user.id,
  email: user.email,
  phone: user.phone,
  fullName: user.fullName,
  role: user.role
});

export class AuthService {
  async signup(req: Request) {
    const { fullName, email, phone, password, role } = req.body;
    if (role !== Role.PATIENT && req.user?.role !== Role.ADMIN) throw unauthorized("Only admins can create staff accounts");
    const existing = await prisma.user.findFirst({ where: { OR: [{ email: email ?? undefined }, { phone: phone ?? undefined }] } });
    if (existing) throw conflict("User already exists");
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        role,
        passwordHash: await hashPassword(password),
        patient: role === Role.PATIENT ? { create: { fullName, phone: phone ?? "", email, patientCode: `PAT-${Date.now()}` } } : undefined
      }
    });
    await writeAuditLog(req, AuditAction.CREATE, "User", user.id, { role });
    return { user: publicUser(user), ...(await this.issueTokens(user.id, user.role)) };
  }

  async login(req: Request) {
    const { identifier, password } = req.body;
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } });
    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) throw unauthorized("Invalid credentials");
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await writeAuditLog(req, AuditAction.LOGIN, "User", user.id);
    return { user: publicUser(user), ...(await this.issueTokens(user.id, user.role)) };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = sha256(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || !stored.user.isActive) throw unauthorized("Invalid refresh token");
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return { user: publicUser(stored.user), ...(await this.issueTokens(payload.sub, payload.role)) };
  }

  async logout(req: Request, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({ where: { tokenHash: sha256(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
    }
    await writeAuditLog(req, AuditAction.LOGOUT, "User", req.user?.id);
    return { ok: true };
  }

  async forgotPassword(identifier: string) {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } });
    if (!user) return { ok: true };
    const token = randomToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: dayjs().add(env.PASSWORD_RESET_TTL_MINUTES, "minute").toDate()
      }
    });
    if (user.email) {
      await emailService.sendMail(user.email, "Reset your Care Concern password", `Use this reset token: ${token}`, user.id);
    }
    return { ok: true, resetToken: env.NODE_ENV === "production" ? undefined : token };
  }

  async resetPassword(req: Request) {
    const { token, password } = req.body;
    const stored = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) throw unauthorized("Invalid reset token");
    await prisma.$transaction([
      prisma.user.update({ where: { id: stored.userId }, data: { passwordHash: await hashPassword(password) } }),
      prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.updateMany({ where: { userId: stored.userId, revokedAt: null }, data: { revokedAt: new Date() } })
    ]);
    await writeAuditLog(req, AuditAction.PASSWORD_RESET, "User", stored.userId);
    return { ok: true };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { patient: true, doctor: true } });
    if (!user) throw notFound("User not found");
    return { ...publicUser(user), patientId: user.patient?.id, doctorId: user.doctor?.id };
  }

  private async issueTokens(userId: string, role: Role) {
    const accessToken = signAccessToken({ sub: userId, role });
    const refreshToken = signRefreshToken({ sub: userId, role });
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(refreshToken),
        expiresAt: dayjs().add(env.REFRESH_TOKEN_TTL_DAYS, "day").toDate()
      }
    });
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();

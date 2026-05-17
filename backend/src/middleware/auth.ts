import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { unauthorized } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(unauthorized());

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { patient: true, doctor: true }
    });
    if (!user || !user.isActive) return next(unauthorized("Invalid or inactive user"));
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id
    };
    return next();
  } catch {
    return next(unauthorized("Invalid or expired access token"));
  }
};

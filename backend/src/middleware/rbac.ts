import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../utils/errors";

export const requireRoles = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden());
  return next();
};

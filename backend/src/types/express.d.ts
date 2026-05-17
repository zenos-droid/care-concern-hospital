import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
      email?: string | null;
      phone?: string | null;
      fullName: string;
      patientId?: string | null;
      doctorId?: string | null;
    }

    interface Request {
      user?: User;
      requestId?: string;
    }
  }
}

export {};

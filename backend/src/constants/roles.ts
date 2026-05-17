import { Role } from "@prisma/client";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["*"],
  DOCTOR: ["appointments:read-own", "appointments:update-own", "medical-records:manage-own", "dashboard:doctor"],
  RECEPTIONIST: ["appointments:manage", "patients:manage", "queue:manage", "dashboard:reception"],
  PATIENT: ["appointments:read-own", "appointments:create-own", "dashboard:patient", "profile:manage-own"]
};
